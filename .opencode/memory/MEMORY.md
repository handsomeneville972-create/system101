# 0.01%SYSTEM — Agent Memory
Slogan: Grow. Audience: aspirational builders, dreamers, goal-oriented community.

## Locked decisions
- Stack: Next.js 15 App Router + TypeScript + Tailwind + shadcn/ui + Supabase (Auth/DB/Storage/Realtime) + Stripe live + Vercel
- Voting: SUPERMAJORITY 80% + 48h timeout (not unanimous veto) for join-requests and Suggy
- Build order: Groups-first (P0 landing/auth/design → P1 Find'em → P2 Suggy → P3 Ebooku → P4 Apps/Donations/De-Course stub)
- Money: free upload free; paid ebook/course = Stripe % on sale (not $0.99 upload fee — uneconomic). $0.99/$5 as sale price floors, platform takes 10%.
- DonateButton: `<DonateButton surface>` with per-surface visibility toggles in settings (home|ebooku|suggy|apps), reversible not delete.
- UI: dark #000/#0A0A0A, hairline rgba(255,255,255,0.08), Geist/Inter, minimal words, lucide icons, 3-col app shell.

## Current state
- P0 DONE: scaffold (Next 16.4.2/Tailwind v4 in temp, copied), dark system, landing, Navbar/Footer, DonateButton
- P1 DONE: Find'em list/profession/group pages + voting util (80%/48h) + schema
- P2 DONE: Suggy feed, Ebooku list/upload, Apps soon, De-Course soon, Settings toggles, Auth OTP, Stripe donate + webhook
- TODO next: Supabase project + env, server actions for votes/uploads, Storage buckets, Stripe Connect payouts, RLS tightening, `npm install` clean + build

## Conventions
- Run: npm run dev / build / lint. Node 24, npm 11.
- Supabase RLS on all tables. Signed URLs for ebooks. No public buckets.
- Stripe webhooks must verify signature. Never commit .env.
