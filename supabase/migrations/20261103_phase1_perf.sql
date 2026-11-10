-- Phase 1 performance migration
-- Safe to run more than once. Apply in the Supabase SQL editor (or `supabase db push`).
--
-- 1) Composite indexes for the public feeds, which all filter by status and
--    order by created_at desc. The existing single-column status indexes force
--    a sort of every published row.
-- 2) RLS policies rewritten from bare auth.uid() to (select auth.uid()) so
--    Postgres evaluates it once per statement instead of once per row.
--    Semantics are unchanged.

-- ---------------------------------------------------------
-- 1) Indexes
-- ---------------------------------------------------------

create index if not exists idx_apps_status_created
  on public.apps(status, created_at desc);

create index if not exists idx_ebooks_status_created
  on public.ebooks(status, created_at desc);

create index if not exists idx_courses_status_created
  on public.courses(status, created_at desc);

create index if not exists idx_suggies_status_created
  on public.suggies(status, created_at desc);

-- Unread badge count and the unread-first inbox list.
create index if not exists idx_notifications_unread_created
  on public.notifications(recipient_id, created_at desc)
  where read_at is null;

-- ---------------------------------------------------------
-- 2) RLS policies (semantics preserved)
-- ---------------------------------------------------------

-- profiles: public read, self insert/update
drop policy if exists "profiles self insert" on public.profiles;
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self insert" on public.profiles for insert
  with check ((select auth.uid()) = id);
create policy "profiles self update" on public.profiles for update
  using ((select auth.uid()) = id);

-- ebooks: published read, uploader owns writes
drop policy if exists "ebooks read" on public.ebooks;
drop policy if exists "ebooks uploader insert" on public.ebooks;
drop policy if exists "ebooks uploader update" on public.ebooks;
create policy "ebooks read" on public.ebooks for select
  using (status = 'published' or (select auth.uid()) = uploader_id);
create policy "ebooks uploader insert" on public.ebooks for insert
  with check ((select auth.uid()) = uploader_id);
create policy "ebooks uploader update" on public.ebooks for update
  using ((select auth.uid()) = uploader_id);

-- suggy_global_votes: voters own their votes, only on published suggies
drop policy if exists "global votes insert" on public.suggy_global_votes;
drop policy if exists "global votes update" on public.suggy_global_votes;
create policy "global votes insert" on public.suggy_global_votes for insert
  with check ((select auth.uid()) = voter_id
    and exists (select 1 from public.suggies s where s.id = suggy_id and s.status = 'published'));
create policy "global votes update" on public.suggy_global_votes for update
  using ((select auth.uid()) = voter_id)
  with check ((select auth.uid()) = voter_id);

-- courses: published read, creator owns writes
drop policy if exists "courses read" on public.courses;
drop policy if exists "courses creator insert" on public.courses;
drop policy if exists "courses creator update" on public.courses;
create policy "courses read" on public.courses for select
  using (status = 'published' or (select auth.uid()) = creator_id);
create policy "courses creator insert" on public.courses for insert
  with check ((select auth.uid()) = creator_id);
create policy "courses creator update" on public.courses for update
  using ((select auth.uid()) = creator_id);

-- apps: published read, uploader owns writes
drop policy if exists "apps read" on public.apps;
drop policy if exists "apps uploader insert" on public.apps;
drop policy if exists "apps uploader update" on public.apps;
create policy "apps read" on public.apps for select
  using (status = 'published' or (select auth.uid()) = uploader_id);
create policy "apps uploader insert" on public.apps for insert
  with check ((select auth.uid()) = uploader_id);
create policy "apps uploader update" on public.apps for update
  using ((select auth.uid()) = uploader_id);

-- Refresh planner statistics for the newly indexed tables.
analyze public.apps;
analyze public.ebooks;
analyze public.courses;
analyze public.suggies;
analyze public.notifications;
