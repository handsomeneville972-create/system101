import { createTimeoutFetch } from "@/lib/fetch-timeout";

const SUPABASE_TIMEOUT_MS = Number(process.env.SUPABASE_FETCH_TIMEOUT_MS ?? 8000);

/**
 * Supabase clients share this fetch so a stalled PostgREST/Auth/Storage call
 * cannot hold a request open indefinitely.
 */
export const supabaseFetch = createTimeoutFetch(SUPABASE_TIMEOUT_MS);
