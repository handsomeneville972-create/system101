import Link from "next/link";
import { cn } from "@/lib/cn";
import type { RangeKey } from "@/lib/data/analytics";

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "7", label: "7D" },
  { key: "30", label: "30D" },
  { key: "90", label: "90D" },
  { key: "all", label: "All" },
];

export function RangeTabs({
  active,
  appId,
}: {
  active: RangeKey;
  appId: string | null;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border hairline p-1">
      {RANGES.map((range) => {
        const params = new URLSearchParams({ range: range.key });
        if (appId) params.set("app", appId);
        return (
          <Link
            key={range.key}
            href={`/dashboard/apps?${params.toString()}`}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs transition-colors",
              active === range.key
                ? "bg-white/10 text-white"
                : "text-zinc-400 hover:text-white"
            )}
          >
            {range.label}
          </Link>
        );
      })}
    </div>
  );
}
