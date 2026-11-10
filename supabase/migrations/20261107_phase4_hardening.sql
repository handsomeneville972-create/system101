-- Phase 4 hardening migration
-- Safe to run more than once. Apply in the Supabase SQL editor (or `supabase db push`).
--
-- 1) Checkout/ownership checks filter payments by item + buyer + status.
-- 2) The app listing fee is one-time per app per buyer; enforce it when the
--    existing data is clean, and skip (with a notice) if duplicates exist so the
--    migration never deletes payment history.
-- 3) Stale pending checkout cleanup gets a narrow partial index.

-- ---------------------------------------------------------
-- 1) Checkout lookup indexes
-- ---------------------------------------------------------

create index if not exists idx_payments_ebook_buyer_status
  on public.payments(ebook_id, buyer_id, status);

create index if not exists idx_payments_app_buyer_status
  on public.payments(app_id, buyer_id, status);

-- ---------------------------------------------------------
-- 2) One successful app listing fee per app + buyer
-- ---------------------------------------------------------

do $$
begin
  if exists (
    select 1
    from public.payments
    where status = 'success' and app_id is not null
    group by app_id, buyer_id
    having count(*) > 1
  ) then
    raise notice 'Skipping uq_payments_success_app_buyer: duplicate success rows exist';
  else
    create unique index if not exists uq_payments_success_app_buyer
      on public.payments(app_id, buyer_id)
      where status = 'success' and app_id is not null;
  end if;
end $$;

-- ---------------------------------------------------------
-- 3) Pending checkout cleanup
-- ---------------------------------------------------------

create index if not exists idx_payments_pending_created
  on public.payments(status, created_at)
  where status = 'pending';

analyze public.payments;
