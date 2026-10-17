# 0.01%SYSTEM — Agent Memory
Slogan: Grow. Audience: aspirational builders, dreamers, goal-oriented community.

## Locked decisions
- Stack: Next.js 16 App Router + TypeScript + Tailwind + shadcn/ui + Supabase (Auth/DB/Storage/Realtime) + Paystack live + Vercel
- Voting: SUPERMAJORITY 80% + 48h timeout (not unanimous veto) for join-requests and Suggy
- Build order: Groups-first (P0 landing/auth/design → P1 Find'em → P2 Suggy → P3 Ebooku → P4 Apps/Donations/De-Course stub)
- Money: Paystack USD (min $2.00). Paid ebook floor $2.99. Platform takes 10% via subaccounts/splits. Donations $5.
- Supabase project ref: geqyrbdxlqhicoytgrq. Keys in C:\Users\Neville\.keys (rotated out of repo).
- DonateButton: `<DonateButton surface>` with per-surface visibility toggles in settings (home|ebooku|suggy|apps), reversible not delete.
- UI: dark #000/#0A0A0A, hairline rgba(255,255,255,0.08), Geist/Inter, minimal words, lucide icons, 3-col app shell.

## Current state
- P0 DONE: scaffold (Next 16.4.2/Tailwind v4 in temp, copied), dark system, landing, Navbar/Footer, DonateButton
- P1 DONE: Find'em list/profession/group pages + voting util (80%/48h) + schema
- P2 DONE: Suggy feed, Ebooku list/upload, Apps soon, De-Course soon, Settings toggles, Auth OTP, Paystack donate + webhook
- 2026-10-17: Paystack swapped in (src/lib/paystack.ts), .env.local created, secrets moved out. TODO: add PAYSTACK_SECRET_KEY, apply schema.sql in dashboard, Storage buckets, server actions for votes/uploads, splits payouts, RLS tightening, npm install + build

## Conventions
- Run: npm run dev / build / lint. Node 24, npm 11.
- Supabase RLS on all tables. Signed URLs for ebooks. No public buckets.
- Paystack webhooks verify HMAC-SHA512 raw body. Never commit .env.local.
- Secrets: `0.01SYSTEM-supabase-keys.txt` lives in C:\Users\Neville\.keys (outside repo). Paid ebook floor $2.99 USD.
