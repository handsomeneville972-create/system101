# 0.01%SYSTEM — Decisions Log
- 2026-10-16: Stack = Next.js 15 + Supabase (user chose over Hono/FastAPI). Reason: MVP speed, RLS, Storage.
- 2026-10-16: Payments = Stripe live (Checkout + Connect + webhooks). Note: $0.99 upload fee uneconomic (~$0.66 net); use 10% on sale.
- 2026-10-16: Voting = supermajority 80% + 48h timeout + leader tie-break (user overrode unanimous veto to avoid deadlock).
- 2026-10-16: Order = Groups-first (Find'em → Suggy before Ebooku).
- 2026-10-16: Donation visibility = per-surface toggles, reversible.
- 2026-10-17: Payments switched Stripe -> Paystack (user request). USD currency (min $2.00), paid ebook floor raised to $2.99. Author payouts via Paystack subaccounts/splits (platform 10%).
- 2026-10-17: Supabase project geqyrbdxlqhicoytgrq wired. New-style keys (sb_publishable/sb_secret). Secrets file moved to C:\Users\Neville\.keys and must be rotated.
- 2026-10-17: Schema apply method = user pastes SQL in Supabase dashboard.
