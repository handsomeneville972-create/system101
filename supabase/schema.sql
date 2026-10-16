-- 0.01%SYSTEM MVP schema (Supabase Postgres + RLS)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text, avatar_url text, profession text, bio text,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "read all" on profiles for select using (true);
create policy "self update" on profiles for update using (auth.uid() = id);
create policy "self insert" on profiles for insert with check (auth.uid() = id);

create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, name text not null, profession text not null,
  leader_id uuid references profiles(id), rules text, active boolean default false,
  created_at timestamptz default now()
);
alter table groups enable row level security;
create policy "groups read" on groups for select using (true);
create policy "leader insert" on groups for insert with check (auth.uid() = leader_id);

create table if not exists group_members (
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text default 'member',
  primary key (group_id, user_id)
);
alter table group_members enable row level security;
create policy "members read" on group_members for select using (true);

create table if not exists join_requests (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  reason text not null, status text default 'pending',
  created_at timestamptz default now()
);
alter table join_requests enable row level security;
create policy "join read" on join_requests for select using (true);

create table if not exists request_votes (
  request_id uuid references join_requests(id) on delete cascade,
  voter_id uuid references profiles(id) on delete cascade,
  yes boolean not null,
  primary key (request_id, voter_id)
);
alter table request_votes enable row level security;
create policy "votes read" on request_votes for select using (true);

create table if not exists ebooks (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text, author_bio text,
  price_cents int default 0, file_path text, cover_path text,
  uploader_id uuid references profiles(id),
  created_at timestamptz default now()
);
alter table ebooks enable row level security;
create policy "ebooks read" on ebooks for select using (true);

create table if not exists suggies (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  title text not null, description text, hashtags text[],
  status text default 'voting', votes_yes int default 0, votes_no int default 0,
  created_at timestamptz default now()
);
alter table suggies enable row level security;
create policy "suggies read" on suggies for select using (status = 'published' or true);
