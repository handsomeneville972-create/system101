import Image from "next/image";
import Link from "next/link";
import { ctr, type AnalyticsApp, type RangeKey } from "@/lib/data/analytics";

function lastClick(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function Status({ status }: { status: string | null }) {
  const published = status === "published";
  return (
    <span
      className={
        published
          ? "rounded-full border border-emerald-400/20 px-2 py-0.5 text-[10px] text-emerald-300/80"
          : "rounded-full border border-amber-400/20 px-2 py-0.5 text-[10px] text-amber-300/80"
      }
    >
      {status ?? "draft"}
    </span>
  );
}

export function AppsTable({
  apps,
  range,
}: {
  apps: AnalyticsApp[];
  range: RangeKey;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-medium">Listings</h2>
        <span className="text-[11px] text-zinc-600">
          {apps.length} app{apps.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-xs">
          <thead className="border-y hairline text-[10px] uppercase tracking-widest text-zinc-500">
            <tr>
              <th className="px-4 py-2 font-medium">App</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 text-right font-medium">Views</th>
              <th className="px-3 py-2 text-right font-medium">Clicks</th>
              <th className="px-3 py-2 text-right font-medium">CTR</th>
              <th className="px-3 py-2 text-right font-medium">Unique</th>
              <th className="px-3 py-2 text-right font-medium">Last click</th>
              <th className="px-4 py-2 text-right font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {apps.map((app) => (
              <tr key={app.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-2.5">
                  <Link
                    href={`/apps/${app.id}`}
                    className="flex items-center gap-2.5"
                  >
                    <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md border hairline bg-white/5">
                      {app.icon_url ? (
                        <Image
                          src={app.icon_url}
                          alt=""
                          fill
                          unoptimized
                          sizes="32px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[10px] text-zinc-500">
                          {app.title.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span className="max-w-[180px] truncate font-medium text-zinc-200">
                      {app.title}
                    </span>
                  </Link>
                </td>
                <td className="px-3 py-2.5">
                  <Status status={app.status} />
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-zinc-300">
                  {app.views.toLocaleString("en-US")}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-zinc-300">
                  {app.clicks.toLocaleString("en-US")}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-zinc-400">
                  {ctr(app.clicks, app.views).toFixed(1)}%
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-zinc-400">
                  {app.uniques.toLocaleString("en-US")}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-zinc-500">
                  {lastClick(app.last_click_at)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {app.status === "draft" ? (
                    <Link
                      href={`/apps/publish/checkout/${app.id}`}
                      className="text-amber-300/80 hover:text-amber-200"
                    >
                      Publish
                    </Link>
                  ) : (
                    <Link
                      href={`/dashboard/apps?app=${app.id}&range=${range}`}
                      className="text-zinc-400 hover:text-white"
                    >
                      Stats
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
