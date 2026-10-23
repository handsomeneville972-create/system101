import { signPaths } from "@/lib/data/apps";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { supabaseServer } from "@/lib/supabase-server";

export type RangeKey = "7" | "30" | "90" | "all";

export const RANGE_DAYS: Record<RangeKey, number> = {
  "7": 7,
  "30": 30,
  "90": 90,
  all: 180,
};

export type AnalyticsTotals = {
  views: number;
  clicks: number;
  uniques: number;
};

export type AnalyticsDaily = {
  day: string;
  views: number;
  clicks: number;
  uniques: number;
};

export type AnalyticsApp = {
  id: string;
  title: string;
  status: string | null;
  icon_path: string | null;
  created_at: string;
  views: number;
  clicks: number;
  uniques: number;
  last_click_at: string | null;
  icon_url?: string | null;
};

export type AnalyticsBreakdown = {
  source: string;
  views: number;
  clicks: number;
};

export type AnalyticsReferrer = {
  host: string;
  views: number;
  clicks: number;
};

export type AnalyticsCountry = {
  country: string;
  views: number;
  clicks: number;
};

export type AnalyticsDevice = {
  device: string;
  views: number;
  clicks: number;
};

export type AnalyticsCampaign = {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  views: number;
  clicks: number;
};

export type AppAnalytics = {
  range: { days: number; from: string; to: string };
  totals: AnalyticsTotals;
  previous: AnalyticsTotals;
  daily: AnalyticsDaily[];
  apps: AnalyticsApp[];
  sources: AnalyticsBreakdown[];
  referrers: AnalyticsReferrer[];
  countries: AnalyticsCountry[];
  devices: AnalyticsDevice[];
  campaigns: AnalyticsCampaign[];
};

export function parseRange(value: string | string[] | undefined): RangeKey {
  return value === "7" || value === "90" || value === "all" ? value : "30";
}

export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

export function ctr(clicks: number, views: number): number {
  return views > 0 ? (clicks / views) * 100 : 0;
}

export async function analyticsFor(
  appId: string | null,
  days: number
): Promise<AppAnalytics | null> {
  const sb = await supabaseServer();
  const { data, error } = await sb.rpc("app_analytics", {
    p_app: appId,
    p_days: days,
  });

  if (error || !data) {
    if (error) console.error("app_analytics failed:", error.message);
    return null;
  }

  const result = data as AppAnalytics;
  const icons = await signPaths(
    "app-icons",
    result.apps.map((app) => app.icon_path ?? "").filter(Boolean)
  );

  return {
    ...result,
    apps: result.apps.map((app) => ({
      ...app,
      icon_url: app.icon_path ? icons[app.icon_path] ?? null : null,
    })),
  };
}

let purgedThisInstance = false;

export async function purgeOldEvents(): Promise<void> {
  if (purgedThisInstance) return;
  purgedThisInstance = true;
  const admin = supabaseAdmin();
  const { error } = await admin.rpc("purge_app_events");
  if (error) console.error("purge_app_events failed:", error.message);
}
