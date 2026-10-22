-- 0.01%SYSTEM schema (Supabase Postgres + RLS) — project geqyrbpdxlqhicoytgrq
-- Order: tables → helper functions → RLS → trigger → RPCs → indexes
-- Idempotent: safe to re-run in full.

-- =========================================================
-- 1) tables
-- =========================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text, avatar_url text, profession text, bio text,
  goals text,
  created_at timestamptz default now()
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, name text not null, profession text not null,
  leader_id uuid references public.profiles(id) on delete set null,
  rules text, active boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.group_members (
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text default 'member' check (role in ('leader','co-leader','member')),
  joined_at timestamptz default now(),
  primary key (group_id, user_id)
);

create table if not exists public.join_requests (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  reason text not null, status text default 'pending' check (status in ('pending','approved','denied')),
  decide_by timestamptz default (now() + interval '48 hours'),
  outcome_reason text,
  created_at timestamptz default now()
);

create table if not exists public.request_votes (
  request_id uuid references public.join_requests(id) on delete cascade,
  voter_id uuid references public.profiles(id) on delete cascade,
  yes boolean not null,
  reason text,
  created_at timestamptz default now(),
  primary key (request_id, voter_id)
);

create table if not exists public.ebooks (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text, author_bio text,
  price_cents int default 0 check (price_cents = 0 or price_cents >= 299),
  currency text default 'USD',
  file_path text, cover_path text, tags text[],
  status text default 'published' check (status in ('draft','published','removed')),
  subaccount_code text,
  uploader_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  ebook_id uuid references public.ebooks(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text, verified_purchase boolean default false,
  created_at timestamptz default now(),
  unique (ebook_id, user_id)
);

create table if not exists public.suggies (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade,
  title text not null, description text, hashtags text[],
  status text default 'voting' check (status in ('draft','voting','published','rejected')),
  votes_yes int default 0, votes_no int default 0,
  outcome_reason text,
  decide_by timestamptz default (now() + interval '48 hours'),
  created_at timestamptz default now()
);

create table if not exists public.suggy_votes (
  suggy_id uuid references public.suggies(id) on delete cascade,
  voter_id uuid references public.profiles(id) on delete cascade,
  up boolean not null,
  reason text,
  created_at timestamptz default now(),
  primary key (suggy_id, voter_id)
);

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  amount_cents int not null, currency text default 'USD',
  surface text, email text,
  created_at timestamptz default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  ebook_id uuid references public.ebooks(id) on delete set null,
  buyer_id uuid references public.profiles(id) on delete set null,
  amount_cents int not null, currency text default 'USD',
  status text default 'pending' check (status in ('pending','success','failed')),
  created_at timestamptz default now()
);

create table if not exists public.payout_accounts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  bank_code text, account_number text, account_name text,
  subaccount_code text unique,
  created_at timestamptz default now()
);

create table if not exists public.group_invites (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade,
  email text,
  token text unique not null default replace(gen_random_uuid()::text, '-', ''),
  status text default 'invited' check (status in ('invited','accepted','expired')),
  expires_at timestamptz default (now() + interval '72 hours'),
  created_at timestamptz default now()
);

create table if not exists public.suggy_global_votes (
  suggy_id uuid references public.suggies(id) on delete cascade,
  voter_id uuid references public.profiles(id) on delete cascade,
  up boolean not null,
  created_at timestamptz default now(),
  primary key (suggy_id, voter_id)
);

-- migrations for pre-existing databases
alter table public.profiles add column if not exists goals text;
alter table public.suggies add column if not exists outcome_reason text;
alter table public.join_requests add column if not exists decided_at timestamptz;
update public.join_requests set decided_at = created_at
  where status in ('approved','denied') and decided_at is null;

-- =========================================================
-- 2) helper functions (after tables so bodies validate)
-- =========================================================

create or replace function public.is_group_member(gid uuid, uid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.group_members m where m.group_id = gid and m.user_id = uid);
$$;

create or replace function public.is_group_leader(gid uuid, uid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.groups g where g.id = gid and g.leader_id = uid);
$$;

-- =========================================================
-- 3) RLS + policies
-- =========================================================

alter table public.profiles enable row level security;
drop policy if exists "profiles read" on public.profiles;
drop policy if exists "profiles self insert" on public.profiles;
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles read" on public.profiles for select using (true);
create policy "profiles self insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);

alter table public.groups enable row level security;
drop policy if exists "groups read" on public.groups;
drop policy if exists "groups leader insert" on public.groups;
drop policy if exists "groups leader update" on public.groups;
create policy "groups read" on public.groups for select using (true);
create policy "groups leader insert" on public.groups for insert with check (auth.uid() = leader_id);
create policy "groups leader update" on public.groups for update using (auth.uid() = leader_id);

alter table public.group_members enable row level security;
drop policy if exists "members read" on public.group_members;
drop policy if exists "members leader insert" on public.group_members;
drop policy if exists "members leader delete" on public.group_members;
create policy "members read" on public.group_members for select using (true);
create policy "members leader insert" on public.group_members for insert
  with check (auth.uid() = user_id or public.is_group_leader(group_id, auth.uid()));
create policy "members leader delete" on public.group_members for delete
  using (public.is_group_leader(group_id, auth.uid()));

alter table public.join_requests enable row level security;
drop policy if exists "join read" on public.join_requests;
drop policy if exists "join applicant insert" on public.join_requests;
drop policy if exists "join member update" on public.join_requests;
create policy "join read" on public.join_requests for select
  using (auth.uid() = user_id or public.is_group_member(group_id, auth.uid()));
create policy "join applicant insert" on public.join_requests for insert
  with check (auth.uid() = user_id);
create policy "join member update" on public.join_requests for update
  using (public.is_group_member(group_id, auth.uid()));

alter table public.request_votes enable row level security;
drop policy if exists "votes read" on public.request_votes;
drop policy if exists "votes member insert" on public.request_votes;
drop policy if exists "votes member update" on public.request_votes;
create policy "votes read" on public.request_votes for select
  using (exists (select 1 from public.join_requests r where r.id = request_id
         and (r.user_id = auth.uid() or public.is_group_member(r.group_id, auth.uid()))));
create policy "votes member insert" on public.request_votes for insert
  with check (auth.uid() = voter_id
    and exists (select 1 from public.join_requests r where r.id = request_id and public.is_group_member(r.group_id, auth.uid())));
create policy "votes member update" on public.request_votes for update
  using (auth.uid() = voter_id) with check (auth.uid() = voter_id);

alter table public.ebooks enable row level security;
drop policy if exists "ebooks read" on public.ebooks;
drop policy if exists "ebooks uploader insert" on public.ebooks;
drop policy if exists "ebooks uploader update" on public.ebooks;
create policy "ebooks read" on public.ebooks for select using (status = 'published' or auth.uid() = uploader_id);
create policy "ebooks uploader insert" on public.ebooks for insert with check (auth.uid() = uploader_id);
create policy "ebooks uploader update" on public.ebooks for update using (auth.uid() = uploader_id);

alter table public.reviews enable row level security;
drop policy if exists "reviews read" on public.reviews;
drop policy if exists "reviews self insert" on public.reviews;
drop policy if exists "reviews self update" on public.reviews;
create policy "reviews read" on public.reviews for select using (true);
create policy "reviews self insert" on public.reviews for insert with check (auth.uid() = user_id);
create policy "reviews self update" on public.reviews for update using (auth.uid() = user_id);

alter table public.suggies enable row level security;
drop policy if exists "suggies read" on public.suggies;
drop policy if exists "suggies leader insert" on public.suggies;
drop policy if exists "suggies leader update" on public.suggies;
create policy "suggies read" on public.suggies for select
  using (status = 'published' or public.is_group_member(group_id, auth.uid()));
create policy "suggies leader insert" on public.suggies for insert
  with check (public.is_group_leader(group_id, auth.uid()));
create policy "suggies leader update" on public.suggies for update
  using (public.is_group_leader(group_id, auth.uid()));

alter table public.suggy_votes enable row level security;
drop policy if exists "suggy_votes read" on public.suggy_votes;
drop policy if exists "suggy_votes member insert" on public.suggy_votes;
drop policy if exists "suggy_votes member update" on public.suggy_votes;
create policy "suggy_votes read" on public.suggy_votes for select
  using (exists (select 1 from public.suggies s where s.id = suggy_id
         and (s.status = 'published' or public.is_group_member(s.group_id, auth.uid()))));
create policy "suggy_votes member insert" on public.suggy_votes for insert
  with check (auth.uid() = voter_id
    and exists (select 1 from public.suggies s where s.id = suggy_id and public.is_group_member(s.group_id, auth.uid())));
create policy "suggy_votes member update" on public.suggy_votes for update
  using (auth.uid() = voter_id) with check (auth.uid() = voter_id);

alter table public.donations enable row level security;
drop policy if exists "donations read" on public.donations;
create policy "donations read" on public.donations for select using (false);

alter table public.payments enable row level security;
drop policy if exists "payments self read" on public.payments;
create policy "payments self read" on public.payments for select using (auth.uid() = buyer_id);

alter table public.payout_accounts enable row level security;
drop policy if exists "payout self" on public.payout_accounts;
create policy "payout self" on public.payout_accounts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.group_invites enable row level security;
drop policy if exists "invites leader read" on public.group_invites;
drop policy if exists "invites leader insert" on public.group_invites;
create policy "invites leader read" on public.group_invites for select
  using (public.is_group_leader(group_id, auth.uid()));
create policy "invites leader insert" on public.group_invites for insert
  with check (public.is_group_leader(group_id, auth.uid()));

alter table public.suggy_global_votes enable row level security;
drop policy if exists "global votes read" on public.suggy_global_votes;
drop policy if exists "global votes insert" on public.suggy_global_votes;
drop policy if exists "global votes update" on public.suggy_global_votes;
create policy "global votes read" on public.suggy_global_votes for select using (true);
create policy "global votes insert" on public.suggy_global_votes for insert
  with check (auth.uid() = voter_id
    and exists (select 1 from public.suggies s where s.id = suggy_id and s.status = 'published'));
create policy "global votes update" on public.suggy_global_votes for update
  using (auth.uid() = voter_id) with check (auth.uid() = voter_id);

-- =========================================================
-- 4) auto-create profile on signup
-- =========================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- 5) RPCs
-- =========================================================

-- atomic join-request settlement (80% supermajority, 48h, leader tie-break)
create or replace function public.settle_join_request(p_request uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  r public.join_requests;
  v_members int;
  v_yes int;
  v_no int;
  v_leader_yes boolean := false;
  v_reason text;
  v_pass boolean;
begin
  select * into r from public.join_requests where id = p_request for update;
  if not found then return jsonb_build_object('status', 'not_found'); end if;
  if r.status <> 'pending' then return jsonb_build_object('status', r.status); end if;

  select count(*) into v_members from public.group_members where group_id = r.group_id;
  select count(*) filter (where yes), count(*) filter (where not yes)
    into v_yes, v_no from public.request_votes where request_id = p_request;
  select coalesce(bool_or(vv.yes), false) into v_leader_yes
    from public.request_votes vv
    join public.groups g on g.id = r.group_id
    where vv.request_id = p_request and vv.voter_id = g.leader_id;
  select reason into v_reason from public.request_votes
    where request_id = p_request and not yes and reason is not null
    order by created_at desc limit 1;

  if (v_yes + v_no) = 0 then
    v_pass := false;
  elsif (v_yes + v_no) >= v_members then
    v_pass := (v_yes::numeric / greatest(v_members, 1)) >= 0.8
              or (v_yes = v_no and v_leader_yes);
  else
    v_pass := (v_yes::numeric / (v_yes + v_no)) >= 0.8;
  end if;

  if v_pass then
    insert into public.group_members(group_id, user_id, role)
      values (r.group_id, r.user_id, 'member') on conflict do nothing;
    update public.join_requests
      set status = 'approved', decided_at = now(), outcome_reason = null
      where id = p_request;
    return jsonb_build_object('status', 'approved');
  end if;

  if (v_yes + v_no) >= v_members or now() >= r.decide_by then
    update public.join_requests
      set status = 'denied', decided_at = now(),
          outcome_reason = coalesce(
            v_reason,
            case when now() >= r.decide_by
              then 'Vote window ended without approval.'
              else 'Not enough yes votes (80% required).'
            end
          )
      where id = p_request;
    return jsonb_build_object('status', 'denied');
  end if;

  return jsonb_build_object('status', 'pending', 'yes', v_yes, 'no', v_no);
end;
$$;

-- lazily settle requests whose 48h window has passed (no cron required)
create or replace function public.settle_due_join_requests(p_group uuid)
returns int language plpgsql security definer set search_path = public as $$
declare
  r record;
  v_count int := 0;
begin
  if auth.uid() is null then return 0; end if;
  for r in
    select id from public.join_requests
    where group_id = p_group and status = 'pending' and decide_by <= now()
  loop
    perform public.settle_join_request(r.id);
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

-- atomic leadership transfer (leader -> any member)
create or replace function public.transfer_group_leadership(p_group uuid, p_new_leader uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  g public.groups;
begin
  if uid is null then return jsonb_build_object('status', 'auth_required'); end if;
  select * into g from public.groups where id = p_group for update;
  if not found then return jsonb_build_object('status', 'not_found'); end if;
  if g.leader_id <> uid then return jsonb_build_object('status', 'forbidden'); end if;
  if p_new_leader = uid then return jsonb_build_object('status', 'same'); end if;
  if not exists (
    select 1 from public.group_members
    where group_id = p_group and user_id = p_new_leader
  ) then return jsonb_build_object('status', 'not_member'); end if;

  update public.groups set leader_id = p_new_leader where id = p_group;
  update public.group_members set role = 'leader'
    where group_id = p_group and user_id = p_new_leader;
  update public.group_members set role = 'member'
    where group_id = p_group and user_id = uid;

  return jsonb_build_object('status', 'transferred');
end;
$$;

-- accept an invite link; activates group once 2 invites accepted
create or replace function public.accept_group_invite(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  inv public.group_invites;
  uid uuid := auth.uid();
  v_accepted int;
begin
  if uid is null then return jsonb_build_object('status', 'auth_required'); end if;
  select * into inv from public.group_invites where token = p_token for update;
  if not found then return jsonb_build_object('status', 'not_found'); end if;
  if inv.status = 'accepted' then
    insert into public.group_members(group_id, user_id, role)
      values (inv.group_id, uid, 'member') on conflict do nothing;
    return jsonb_build_object('status', 'already');
  end if;
  if inv.expires_at is not null and now() > inv.expires_at then
    update public.group_invites set status = 'expired' where id = inv.id;
    return jsonb_build_object('status', 'expired');
  end if;

  update public.group_invites set status = 'accepted' where id = inv.id;
  insert into public.group_members(group_id, user_id, role)
    values (inv.group_id, uid, 'member') on conflict do nothing;

  select count(*) into v_accepted
    from public.group_invites where group_id = inv.group_id and status = 'accepted';
  if v_accepted >= 2 then
    update public.groups set active = true where id = inv.group_id;
  end if;

  return jsonb_build_object('status', 'accepted', 'active', v_accepted >= 2);
end;
$$;

-- public-safe invite preview by token
create or replace function public.join_invite_info(p_token text)
returns jsonb language sql security definer stable set search_path = public as $$
  select jsonb_build_object(
    'group_name', g.name,
    'group_slug', g.slug,
    'status', i.status,
    'expired', (i.expires_at is not null and now() > i.expires_at)
  )
  from public.group_invites i
  join public.groups g on g.id = i.group_id
  where i.token = p_token;
$$;

-- atomic suggy settlement (80% of members, 48h, leader tie-break)
create or replace function public.settle_suggy(p_suggy uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  s public.suggies;
  v_members int;
  v_up int;
  v_down int;
  v_leader_up boolean := false;
  v_pass boolean;
  v_reason text;
begin
  select * into s from public.suggies where id = p_suggy for update;
  if not found then return jsonb_build_object('status', 'not_found'); end if;
  if s.status <> 'voting' then return jsonb_build_object('status', s.status); end if;

  select count(*) into v_members from public.group_members where group_id = s.group_id;
  select count(*) filter (where up), count(*) filter (where not up)
    into v_up, v_down from public.suggy_votes where suggy_id = p_suggy;
  select coalesce(bool_or(vv.up), false) into v_leader_up
    from public.suggy_votes vv
    join public.groups g on g.id = s.group_id
    where vv.suggy_id = p_suggy and vv.voter_id = g.leader_id;
  select reason into v_reason from public.suggy_votes
    where suggy_id = p_suggy and not up and reason is not null
    order by created_at desc limit 1;

  if (v_up + v_down) = 0 then
    v_pass := false;
  elsif (v_up + v_down) >= v_members then
    v_pass := (v_up::numeric / greatest(v_members, 1)) >= 0.8 or (v_up = v_down and v_leader_up);
  else
    v_pass := (v_up::numeric / (v_up + v_down)) >= 0.8;
  end if;

  update public.suggies set votes_yes = v_up, votes_no = v_down where id = p_suggy;

  if v_pass then
    update public.suggies set status = 'published', outcome_reason = null where id = p_suggy;
    return jsonb_build_object('status', 'published');
  end if;

  if (v_up + v_down) >= v_members or now() >= s.decide_by then
    update public.suggies set status = 'rejected', outcome_reason = v_reason where id = p_suggy;
    return jsonb_build_object('status', 'rejected');
  end if;

  return jsonb_build_object('status', 'voting', 'up', v_up, 'down', v_down);
end;
$$;

-- =========================================================
-- 6) indexes
-- =========================================================

create index if not exists idx_groups_profession on public.groups(profession);
create index if not exists idx_join_requests_group on public.join_requests(group_id, status);
create index if not exists idx_suggies_status on public.suggies(status);
create index if not exists idx_suggies_group_status on public.suggies(group_id, status);
create index if not exists idx_ebooks_status on public.ebooks(status);
create index if not exists idx_reviews_ebook on public.reviews(ebook_id);
create index if not exists idx_payments_buyer on public.payments(buyer_id);
create index if not exists idx_group_invites_group on public.group_invites(group_id, status);
create index if not exists idx_global_votes_suggy on public.suggy_global_votes(suggy_id, up);
create index if not exists idx_join_requests_user_group
  on public.join_requests(user_id, group_id, status, decided_at desc);

-- =========================================================
-- 7) P3 — Ebooku, settings, notify
-- =========================================================

alter table public.profiles
  add column if not exists donate_surfaces jsonb not null
  default '{"home":true,"ebooku":true,"suggy":true,"apps":true}'::jsonb;

create table if not exists public.notify_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  surface text not null check (surface in ('apps','decourse')),
  created_at timestamptz default now(),
  unique (email, surface)
);

alter table public.notify_requests enable row level security;

create index if not exists idx_ebooks_uploader on public.ebooks(uploader_id);
create index if not exists idx_notify_requests_surface on public.notify_requests(surface);

-- Storage: private buckets, uploads only to own folder
insert into storage.buckets (id, name, public)
values ('ebook-files','ebook-files',false), ('ebook-covers','ebook-covers',false)
on conflict (id) do nothing;

drop policy if exists "ebook files upload own" on storage.objects;
create policy "ebook files upload own" on storage.objects for insert to authenticated
  with check (
    bucket_id in ('ebook-files','ebook-covers')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "ebook files delete own" on storage.objects;
create policy "ebook files delete own" on storage.objects for delete to authenticated
  using (
    bucket_id in ('ebook-files','ebook-covers')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =========================================================
-- 8) Community core — avatars
-- =========================================================

insert into storage.buckets (id, name, public)
values ('avatars','avatars',false)
on conflict (id) do nothing;

drop policy if exists "avatars upload own" on storage.objects;
create policy "avatars upload own" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars update own" on storage.objects;
create policy "avatars update own" on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars delete own" on storage.objects;
create policy "avatars delete own" on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =========================================================
-- 9) De-Course — video links + PDF resources
-- =========================================================

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  level text not null default 'beginner'
    check (level in ('beginner','intermediate','advanced')),
  video_provider text not null check (video_provider in ('youtube','vimeo')),
  video_id text not null,
  video_hash text,
  video_url text not null,
  pdf_path text,
  tags text[],
  status text default 'published' check (status in ('published','removed')),
  creator_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.courses enable row level security;
drop policy if exists "courses read" on public.courses;
drop policy if exists "courses creator insert" on public.courses;
drop policy if exists "courses creator update" on public.courses;
create policy "courses read" on public.courses for select
  using (status = 'published' or auth.uid() = creator_id);
create policy "courses creator insert" on public.courses for insert
  with check (auth.uid() = creator_id);
create policy "courses creator update" on public.courses for update
  using (auth.uid() = creator_id);

create index if not exists idx_courses_status on public.courses(status);
create index if not exists idx_courses_creator on public.courses(creator_id);

insert into storage.buckets (id, name, public)
values ('course-files','course-files',false)
on conflict (id) do nothing;

drop policy if exists "course files upload own" on storage.objects;
create policy "course files upload own" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'course-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "course files update own" on storage.objects;
create policy "course files update own" on storage.objects for update to authenticated
  using (
    bucket_id = 'course-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "course files delete own" on storage.objects;
create policy "course files delete own" on storage.objects for delete to authenticated
  using (
    bucket_id = 'course-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
