/**
 * Public feed cache policy.
 *
 * These feeds embed Supabase signed URLs for app icons and ebook covers.
 * Those URLs expire after one hour, so the cached payload must never be
 * served for longer than that. Revalidate every 5 minutes and hard-expire
 * at 25 minutes, which leaves at least 35 minutes of URL validity.
 */
export const PUBLIC_FEED_CACHE = {
  stale: 300,
  revalidate: 300,
  expire: 1500,
} as const;

/** Cache tags for public, non-user-specific data. */
export const TAGS = {
  apps: "apps",
  ebooks: "ebooks",
  courses: "courses",
  groups: "groups",
  suggy: "suggy",
} as const;
