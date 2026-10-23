export function BreakdownList({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: { label: string; value: number; detail?: string }[];
  empty?: string;
}) {
  const max = Math.max(1, ...rows.map((row) => row.value));

  return (
    <div className="card p-4">
      <h2 className="text-sm font-medium">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-xs text-zinc-600">{empty ?? "No data yet."}</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="flex items-baseline justify-between gap-3 text-xs">
                <span className="truncate text-zinc-300">{row.label}</span>
                <span className="shrink-0 tabular-nums text-zinc-500">
                  {row.value.toLocaleString("en-US")}
                </span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-white/40"
                  style={{ width: `${(row.value / max) * 100}%` }}
                />
              </div>
              {row.detail && (
                <p className="mt-0.5 text-[10px] text-zinc-600">{row.detail}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
