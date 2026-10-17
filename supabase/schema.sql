-- 0.01%SYSTEM MVP schema (Supabase Postgres + RLS)
-- Apply in Supabase SQL Editor for project geqyrbdxlqhicoytgrq

-- =========================================================
-- helpers
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
-- profiles
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text, avatar_url text, profession text, bio text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
drop policy if exists "profiles read" on public.profiles;
drop policy if exists "profiles self insert" on public.profiles;
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles read" on public.profiles for select using (true);
create policy "profiles self insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);

-- auto-create profile on signup
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
-- groups + members
-- =========================================================
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, name text not null, profession text not null,
  leader_id uuid references public.profiles(id) on delete set null,
  rules text, active boolean default false,
  created_at timestamptz default now()
);
alter table public.groups enable row level security;
drop policy if exists "groups read" on public.groups;
drop policy if exists "groups leader insert" on public.groups;
drop policy if exists "groups leader update" on public.groups;
create policy "groups read" on public.groups for select using (true);
create policy "groups leader insert" on public.groups for insert with check (auth.uid() = leader_id);
create policy "groups leader update" on public.groups for update using (auth.uid() = leader_id);

create table if not exists public.group_members (
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text default 'member' check (role in ('leader','co-leader','member')),
  joined_at timestamptz default now(),
  primary key (group_id, user_id)
);
alter table public.group_members enable row level security;
drop policy if exists "members read" on public.group_members;
drop policy if exists "members leader insert" on public.group_members;
drop policy if exists "members leader delete" on public.group_members;
create policy "members read" on public.group_members for select using (true);
create policy "members leader insert" on public.group_members for insert
  with check (auth.uid() = user_id or public.is_group_leader(group_id, auth.uid()));
create policy "members leader delete" on public.group_members for delete
  using (public.is_group_leader(group_id, auth.uid()));

-- =========================================================
-- join requests + votes
-- =========================================================
create table if not exists public.join_requests (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  reason text not null, status text default 'pending' check (status in ('pending','approved','denied')),
  decide_by timestamptz default (now() + interval '48 hours'),
  outcome_reason text,
  created_at timestamptz default now()
);
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

create table if not exists public.request_votes (
  request_id uuid references public.join_requests(id) on delete cascade,
  voter_id uuid references public.profiles(id) on delete cascade,
  yes boolean not null,
  reason text,
  created_at timestamptz default now(),
  primary key (request_id, voter_id)
);
alter table public.request_votes enable row level security;
drop policy if exists "votes read" on public.request_votes;
drop policy if exists "votes member insert" on public.request_votes;
create policy "votes read" on public.request_votes for select
  using (exists (select 1 from public.join_requests r where r.id = request_id
         and (r.user_id = auth.uid() or public.is_group_member(r.group_id, auth.uid()))));
create policy "votes member insert" on public.request_votes for insert
  with check (auth.uid() = voter_id
    and exists (select 1 from public.join_requests r where r.id = request_id and public.is_group_member(r.group_id, auth.uid())));

-- =========================================================
-- ebooks + reviews
-- =========================================================
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
alter table public.ebooks enable row level security;
drop policy if exists "ebooks read" on public.ebooks;
drop policy if exists "ebooks uploader insert" on public.ebooks;
drop policy if exists "ebooks uploader update" on public.ebooks;
create policy "ebooks read" on public.ebooks for select using (status = 'published' or auth.uid() = uploader_id);
create policy "ebooks uploader insert" on public.ebooks for insert with check (auth.uid() = uploader_id);
create policy "ebooks uploader update" on public.ebooks for update using (auth.uid() = uploader_id);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  ebook_id uuid references public.ebooks(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text, verified_purchase boolean default false,
  created_at timestamptz default now(),
  unique (ebook_id, user_id)
);
alter table public.reviews enable row level security;
drop policy if exists "reviews read" on public.reviews;
drop policy if exists "reviews self insert" on public.reviews;
drop policy if exists "reviews self update" on public.reviews;
create policy "reviews read" on public.reviews for select using (true);
create policy "reviews self insert" on public.reviews for insert with check (auth.uid() = user_id);
create policy "reviews self update" on public.reviews for update using (auth.uid() = user_id);

-- =========================================================
-- suggies + votes
-- =========================================================
create table if not exists public.suggies (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade,
  title text not null, description text, hashtags text[],
  status text default 'voting' check (status in ('draft','voting','published','rejected')),
  votes_yes int default 0, votes_no int default 0,
  decide_by timestamptz default (now() + interval '48 hours'),
  created_at timestamptz default now()
);
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

create table if not exists public.suggy_votes (
  suggy_id uuid references public.suggies(id) on delete cascade,
  voter_id uuid references public.profiles(id) on delete cascade,
  up boolean not null,
  reason text,
  created_at timestamptz default now(),
  primary key (suggy_id, voter_id)
);
alter table public.suggy_votes enable row level security;
drop policy if exists "suggy_votes read" on public.suggy_votes;
drop policy if exists "suggy_votes member insert" on public.suggy_votes;
create policy "suggy_votes read" on public.suggy_votes for select
  using (exists (select 1 from public.suggies s where s.id = suggy_id
         and (s.status = 'published' or public.is_group_member(s.group_id, auth.uid()))));
create policy "suggy_votes member insert" on public.suggy_votes for insert
  with check (auth.uid() = voter_id
    and exists (select 1 from public.suggies s where s.id = suggy_id and public.is_group_member(s.group_id, auth.uid())));

-- =========================================================
-- payments (Paystack) — written by service role/webhook
-- =========================================================
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  amount_cents int not null, currency text default 'USD',
  surface text, email text,
  created_at timestamptz default now()
);
alter table public.donations enable row level security;
drop policy if exists "donations read" on public.donations;
create policy "donations read" on public.donations for select using (false);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  ebook_id uuid references public.ebooks(id) on delete set null,
  buyer_id uuid references public.profiles(id) on delete set null,
  amount_cents int not null, currency text default 'USD',
  status text default 'pending' check (status in ('pending','success','failed')),
  created_at timestamptz default now()
);
alter table public.payments enable row level security;
drop policy if exists "payments self read" on public.payments;
create policy "payments self read" on public.payments for select using (auth.uid() = buyer_id);

create table if not exists public.payout_accounts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  bank_code text, account_number text, account_name text,
  subaccount_code text unique,
  created_at timestamptz default now()
);
alter table public.payout_accounts enable row level security;
drop policy if exists "payout self" on public.payout_accounts;
create policy "payout self" on public.payout_accounts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- indexes
-- =========================================================
create index if not exists idx_groups_profession on public.groups(profession);
create index if not exists idx_join_requests_group on public.join_requests(group_id, status);
create index if not exists idx_suggies_status on public.suggies(status);
create index if not exists idx_ebooks_status on public.ebooks(status);
create index if not exists idx_reviews_ebook on public.reviews(ebook_id);
create index if not exists idx_payments_buyer on public.payments(buyer_id);
