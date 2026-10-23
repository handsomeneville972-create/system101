import type { AnalyticsDaily } from "@/lib/data/analytics";

const WIDTH = 720;
const HEIGHT = 200;
const PAD_X = 28;
const PAD_Y = 18;

function dayLabel(day: string) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function TrendChart({ data }: { data: AnalyticsDaily[] }) {
  const views = data.reduce((sum, day) => sum + day.views, 0);
  const clicks = data.reduce((sum, day) => sum + day.clicks, 0);

  if (data.length === 0) {
    return (
      <div className="card p-4">
        <h2 className="text-sm font-medium">Traffic</h2>
        <p className="mt-2 text-xs text-zinc-600">No data in this range yet.</p>
      </div>
    );
  }

  const max = Math.max(1, ...data.map((day) => Math.max(day.views, day.clicks)));
  const xAt = (index: number) =>
    data.length <= 1
      ? WIDTH / 2
      : PAD_X + (index * (WIDTH - PAD_X * 2)) / (data.length - 1);
  const yAt = (value: number) =>
    HEIGHT - PAD_Y - (value / max) * (HEIGHT - PAD_Y * 2);
  const line = (key: "views" | "clicks") =>
    data
      .map(
        (day, index) =>
          `${index === 0 ? "M" : "L"}${xAt(index).toFixed(1)},${yAt(day[key]).toFixed(1)}`
      )
      .join(" ");

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium">Traffic</h2>
        <div className="flex items-center gap-3 text-[11px] text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white" />
            Views {views.toLocaleString("en-US")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-zinc-400" />
            Clicks {clicks.toLocaleString("en-US")}
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-3 h-48 w-full"
        role="img"
        aria-label="Daily listing views and outbound clicks"
      >
        {[0, 1, 2, 3, 4].map((step) => {
          const y = PAD_Y + (step * (HEIGHT - PAD_Y * 2)) / 4;
          return (
            <line
              key={step}
              x1={PAD_X}
              x2={WIDTH - PAD_X}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          );
        })}
        <path
          d={line("views")}
          fill="none"
          stroke="#fafafa"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={line("clicks")}
          fill="none"
          stroke="#a1a1aa"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="flex justify-between text-[10px] text-zinc-600">
        <span>{dayLabel(data[0].day)}</span>
        <span>{dayLabel(data[Math.floor(data.length / 2)].day)}</span>
        <span>{dayLabel(data[data.length - 1].day)}</span>
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-[11px] text-zinc-500 hover:text-zinc-300">
          Daily data
        </summary>
        <div className="mt-2 max-h-48 overflow-auto rounded-md border hairline">
          <table className="w-full text-left text-[11px]">
            <thead className="sticky top-0 bg-[#0a0a0a] text-zinc-500">
              <tr>
                <th className="px-2 py-1.5 font-medium">Date</th>
                <th className="px-2 py-1.5 text-right font-medium">Views</th>
                <th className="px-2 py-1.5 text-right font-medium">Clicks</th>
                <th className="px-2 py-1.5 text-right font-medium">Unique</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-zinc-400">
              {data.map((day) => (
                <tr key={day.day}>
                  <td className="px-2 py-1">{day.day}</td>
                  <td className="px-2 py-1 text-right tabular-nums">{day.views}</td>
                  <td className="px-2 py-1 text-right tabular-nums">{day.clicks}</td>
                  <td className="px-2 py-1 text-right tabular-nums">{day.uniques}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
