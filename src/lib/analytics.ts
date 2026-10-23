import { createHash } from "node:crypto";
import { isbot } from "isbot";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type EventKind = "view" | "click";
export type EventTarget = "website" | "repo";
export type EventSource = "directory" | "profile" | "external" | "direct";
export type DeviceKind = "desktop" | "mobile" | "tablet" | "bot" | "unknown";

export type TrackedEventInput = {
  appId: string;
  kind: EventKind;
  target?: EventTarget | null;
  ip: string | null;
  userAgent: string | null;
  referrer: string | null;
  search: string;
  country: string | null;
};

export type AppEventRow = {
  app_id: string;
  kind: EventKind;
  target: EventTarget | null;
  source: EventSource;
  visitor_hash: string;
  dedupe_key: string;
  country: string | null;
  device: DeviceKind;
  is_bot: boolean;
  referrer_host: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
};

export type Utm = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
};

const DEDUPE_WINDOW_MS = 5 * 60 * 1000;
const INTERNAL_HOSTS = new Set([
  "system101.network",
  "www.system101.network",
  "localhost",
  "127.0.0.1",
]);

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function clean(value: string | null | undefined, max = 80) {
  if (!value) return null;
  const trimmed = value.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

export function clientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || headers.get("x-real-ip")?.trim() || null;
}

export function countryCode(value: string | null | undefined): string | null {
  const code = value?.trim().toUpperCase();
  return code && /^[A-Z]{2}$/.test(code) ? code : null;
}

export function utmFrom(search: string | null | undefined): Utm {
  const params = new URLSearchParams(
    search?.startsWith("?") ? search : `?${search ?? ""}`
  );
  return {
    utm_source: clean(params.get("utm_source")),
    utm_medium: clean(params.get("utm_medium")),
    utm_campaign: clean(params.get("utm_campaign")),
  };
}

function parseUrl(value: string | null | undefined): URL | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function isInternalHost(hostname: string) {
  const host = hostname.toLowerCase();
  if (INTERNAL_HOSTS.has(host)) return true;
  const vercel = process.env.VERCEL_URL?.toLowerCase();
  if (vercel && host === vercel) return true;
  return host.endsWith(".vercel.app");
}

export function referrerInfo(referrer: string | null | undefined): {
  source: EventSource;
  host: string | null;
} {
  const url = parseUrl(referrer);
  if (!url) return { source: "direct", host: null };

  if (isInternalHost(url.hostname)) {
    if (url.pathname.startsWith("/apps")) return { source: "directory", host: null };
    if (url.pathname.startsWith("/u/")) return { source: "profile", host: null };
    return { source: "direct", host: null };
  }

  return {
    source: "external",
    host: url.hostname.toLowerCase().replace(/^www\./, "").slice(0, 120),
  };
}

export function visitorHash(
  ip: string | null,
  userAgent: string | null,
  now = new Date()
) {
  const salt =
    process.env.ANALYTICS_SALT?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "001system-local";
  const day = now.toISOString().slice(0, 10);
  return sha256(`${ip ?? "unknown"}|${userAgent ?? "unknown"}|${salt}|${day}`);
}

export function deviceKind(userAgent: string | null): DeviceKind {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(ua)) return "tablet";
  if (/mobi|android|iphone|ipod/.test(ua)) return "mobile";
  return "desktop";
}

export function dedupeKey(
  appId: string,
  kind: EventKind,
  target: EventTarget | null,
  visitor: string,
  now = new Date()
) {
  const bucket = Math.floor(now.getTime() / DEDUPE_WINDOW_MS);
  return sha256(`${appId}|${kind}|${target ?? ""}|${visitor}|${bucket}`);
}

export function buildAppEvent(
  input: TrackedEventInput,
  now = new Date()
): AppEventRow {
  const userAgent = input.userAgent?.slice(0, 512) ?? null;
  const bot = !userAgent || isbot(userAgent);
  const utm = utmFrom(input.search);
  const referrer = referrerInfo(input.referrer);
  const visitor = visitorHash(input.ip, userAgent, now);
  const target = input.kind === "click" ? input.target ?? "website" : null;

  return {
    app_id: input.appId,
    kind: input.kind,
    target,
    source: referrer.source,
    visitor_hash: visitor,
    dedupe_key: dedupeKey(input.appId, input.kind, target, visitor, now),
    country: countryCode(input.country),
    device: bot ? "bot" : deviceKind(userAgent),
    is_bot: bot,
    referrer_host: referrer.host,
    ...utm,
    created_at: now.toISOString(),
  };
}

export function trackedDestination(
  raw: string | null | undefined,
  campaign?: string | null
): string | null {
  const url = parseUrl(raw);
  if (!url) return null;
  if (!url.searchParams.has("utm_source")) url.searchParams.set("utm_source", "system101");
  if (!url.searchParams.has("utm_medium")) url.searchParams.set("utm_medium", "directory");
  if (!url.searchParams.has("ref")) url.searchParams.set("ref", "system101");
  const cleanCampaign = clean(campaign);
  if (cleanCampaign && !url.searchParams.has("utm_campaign")) {
    url.searchParams.set("utm_campaign", cleanCampaign);
  }
  return url.toString();
}

export async function recordAppEvent(input: TrackedEventInput): Promise<void> {
  try {
    const event = buildAppEvent(input);
    const admin = supabaseAdmin();
    const { error } = await admin
      .from("app_events")
      .upsert(event, { onConflict: "dedupe_key", ignoreDuplicates: true });
    if (error) console.error("app_events insert failed:", error.message);
  } catch (error) {
    console.error("app_events insert failed:", error);
  }
}
