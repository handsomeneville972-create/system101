import Link from "next/link";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { BarChart3, Download } from "lucide-react";
import { AppsTable } from "@/components/dashboard/AppsTable";
import { BreakdownList } from "@/components/dashboard/BreakdownList";
import { RangeTabs } from "@/components/dashboard/RangeTabs";
import { StatCard } from "@/components/dashboard/StatCard";
import { TrackedLinkBuilder } from "@/components/dashboard/TrackedLinkBuilder";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { cn } from "@/lib/cn";
import { getUser } from "@/lib/auth";
import {
  analyticsFor,
  ctr,
  parseRange,
  pctChange,
  purgeOldEvents,
  RANGE_DAYS,
} from "@/lib/data/analytics";

export const instant = false;

const SOURCE_LABELS: Record<string, string> = {
  directory: "Community directory",
  profile: "Member profiles",
  external: "External sites",
  direct: "Direct",
};

const regions = new Intl.DisplayNames(["en"], { type: "region" });

function countryName(code: string) {
  try {
    return regions.of(code) ?? code;
  } catch {
    return code;
  }
}

function dayLabel(day: string) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "max-w-[180px] truncate rounded-full border px-2.5 py-1 text-xs transition-colors",
        active
          ? "border-white/20 bg-white/10 text-white"
          : "border-white/[0.08] text-zinc-400 hover:text-white"
      )}
    >
      {children}
    </Link>
  );
}

export default async function DashboardApps({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getUser();
  if (!user) redirect("/auth/sign-in?next=/dashboard/apps");

  const query = await searchParams;
  const range = parseRange(query.range);
  const days = RANGE_DAYS[range];
  const requested = typeof query.app === "string" ? query.app : null;

  after(() => purgeOldEvents());

  const all = await analyticsFor(null, days);
  if (!all) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold">App analytics</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Could not load analytics. Refresh to try again.
        </p>
      </div>
    );
  }

  const selectedId =
    requested && all.apps.some((app) => app.id === requested)
      ? requested
      : null;
  const data = selectedId ? await analyticsFor(selectedId, days) : all;

  if (!data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold">App analytics</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Could not load analytics. Refresh to try again.
        </p>
      </div>
    );
  }

  if (all.apps.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">App analytics</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Views and outbound clicks on your community listings.
            </p>
          </div>
          <Link
            href="/apps/publish"
            className="btn-pill bg-white px-5 py-2 text-sm font-medium text-black"
          >
            Publish an app
          </Link>
        </div>

        <div className="card mt-6 p-10 text-center">
          <BarChart3 className="mx-auto h-6 w-6 text-zinc-600" aria-hidden />
          <p className="mt-3 text-sm text-zinc-400">No listings yet.</p>
          <p className="mt-1 text-xs text-zinc-600">
            Publish an app to start collecting views and clicks.
          </p>
          <Link
            href="/apps/publish"
            className="btn-pill mt-4 inline-flex bg-white px-5 py-2 text-sm font-medium text-black"
          >
            Publish an app
          </Link>
        </div>
      </div>
    );
  }

  const currentCtr = ctr(data.totals.clicks, data.totals.views);
  const previousCtr = ctr(data.previous.clicks, data.previous.views);
  const lastDay = data.daily[data.daily.length - 1];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">App analytics</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Views and outbound clicks on your community listings.
          </p>
        </div>
        <Link
          href="/apps/publish"
          className="btn-pill bg-white px-5 py-2 text-sm font-medium text-black"
        >
          Publish an app
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <RangeTabs active={range} appId={selectedId} />
          <div className="flex flex-wrap items-center gap-1.5">
            <FilterPill
              href={`/dashboard/apps?range=${range}`}
              active={!selectedId}
            >
              All apps
            </FilterPill>
            {all.apps.map((app) => (
              <FilterPill
                key={app.id}
                href={`/dashboard/apps?app=${app.id}&range=${range}`}
                active={selectedId === app.id}
              >
                {app.title}
              </FilterPill>
            ))}
          </div>
        </div>

        <Link
          href={`/dashboard/apps/export?range=${range}${selectedId ? `&app=${selectedId}` : ""}`}
          prefetch={false}
          className="btn-pill inline-flex items-center gap-2 border hairline px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5"
        >
          <Download size={13} aria-hidden />
          Export CSV
        </Link>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Views"
          value={data.totals.views.toLocaleString("en-US")}
          delta={range === "all" ? undefined : pctChange(data.totals.views, data.previous.views)}
          hint="Listing page views"
        />
        <StatCard
          label="Clicks"
          value={data.totals.clicks.toLocaleString("en-US")}
          delta={range === "all" ? undefined : pctChange(data.totals.clicks, data.previous.clicks)}
          hint="Outbound to the app"
        />
        <StatCard
          label="CTR"
          value={`${currentCtr.toFixed(1)}%`}
          delta={range === "all" ? undefined : pctChange(currentCtr, previousCtr)}
          hint="Clicks ÷ views"
        />
        <StatCard
          label="Unique visitors"
          value={data.totals.uniques.toLocaleString("en-US")}
          delta={range === "all" ? undefined : pctChange(data.totals.uniques, data.previous.uniques)}
          hint="Daily anonymous hashes"
        />
        <StatCard
          label="Clicks today"
          value={(lastDay?.clicks ?? 0).toLocaleString("en-US")}
          hint={lastDay ? dayLabel(lastDay.day) : undefined}
        />
      </div>

      <div className="mt-4">
        <TrendChart data={data.daily} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <BreakdownList
          title="Sources"
          rows={data.sources.map((row) => ({
            label: SOURCE_LABELS[row.source] ?? row.source,
            value: row.views + row.clicks,
            detail: `${row.views} views · ${row.clicks} clicks`,
          }))}
        />
        <BreakdownList
          title="Referrers"
          rows={data.referrers.map((row) => ({
            label: row.host,
            value: row.views + row.clicks,
            detail: `${row.views} views · ${row.clicks} clicks`,
          }))}
          empty="No external referrers yet."
        />
        <BreakdownList
          title="Countries"
          rows={data.countries.map((row) => ({
            label: countryName(row.country),
            value: row.views + row.clicks,
            detail: `${row.views} views · ${row.clicks} clicks`,
          }))}
          empty="No location data yet."
        />
        <BreakdownList
          title="Devices"
          rows={data.devices.map((row) => ({
            label: row.device.charAt(0).toUpperCase() + row.device.slice(1),
            value: row.views + row.clicks,
            detail: `${row.views} views · ${row.clicks} clicks`,
          }))}
          empty="No device data yet."
        />
        <BreakdownList
          title="Campaigns"
          rows={data.campaigns.map((row) => ({
            label:
              [row.source, row.medium, row.campaign].filter(Boolean).join(" / ") ||
              "Untitled",
            value: row.views + row.clicks,
            detail: `${row.views} views · ${row.clicks} clicks`,
          }))}
          empty="No tagged campaigns yet."
        />
      </div>

      <div className="mt-4">
        <AppsTable apps={data.apps} range={range} />
      </div>

      <div className="mt-4">
        <TrackedLinkBuilder appId={selectedId ?? all.apps[0].id} />
      </div>

      <p className="mt-4 text-[11px] text-zinc-600">
        Bots and owner clicks are excluded. Anonymous events are kept for 180
        days.
      </p>
    </div>
  );
}
