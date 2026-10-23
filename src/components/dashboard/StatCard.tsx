import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  delta,
  hint,
}: {
  label: string;
  value: string;
  delta?: number | null;
  hint?: string;
}) {
  return (
    <div className="card p-4">
      <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      <div className="mt-2 flex items-baseline justify-between gap-2">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        {delta !== undefined && <Delta value={delta} />}
      </div>
      {hint && <p className="mt-1 text-[11px] text-zinc-600">{hint}</p>}
    </div>
  );
}

function Delta({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-[11px] text-zinc-500">new</span>;
  }

  const Icon = value > 0 ? ArrowUpRight : value < 0 ? ArrowDownRight : Minus;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] tabular-nums",
        value > 0
          ? "text-emerald-400"
          : value < 0
            ? "text-red-400"
            : "text-zinc-500"
      )}
    >
      <Icon size={13} aria-hidden />
      {Math.abs(value)}%
    </span>
  );
}
