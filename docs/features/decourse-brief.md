# De-Course brief

Free, member-uploaded courses. Decision: no hosted video in MVP — creators paste a YouTube or Vimeo link (unlisted links supported) and may attach one PDF of notes.

## Flow
1. Signed-in member opens `/decourse/upload`.
2. Form validates title, description (≥20 chars), level, and a YouTube/Vimeo URL. Optional PDF notes (≤20MB) go straight to the private `course-files` bucket via a server-issued signed upload URL.
3. Server action re-validates the link (allowlisted hosts, restricted ids), verifies the uploaded PDF (own folder, MIME, size), and inserts the course.
4. `/decourse` lists published courses. `/decourse/[id]` embeds the provider player (`youtube-nocookie.com` or `player.vimeo.com`), links the creator profile, and serves notes through `GET /decourse/[id]/download` → 302 to a 5-minute signed URL.

## Storage / security
- Table `courses` (schema §9), RLS: public read `published`, creator read own removed; insert/update creator-only.
- Private bucket `course-files`; own-folder insert/update/delete policies.
- No raw iframe URLs: provider + id (+ Vimeo unlisted hash) are parsed and stored; the embed URL is rebuilt server-side.
- Access is free; upload requires an account. Removal is a soft delete (`status='removed'`).

## Deferred
- $5 paid upload and any course purchase model (needs Paystack USD; economics not defined).
- Multiple PDFs/lessons/modules, ratings/reviews, search/filters, cover art, hosted video, moderation.
