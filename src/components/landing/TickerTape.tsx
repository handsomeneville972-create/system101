const ITEMS = [
  "Find'em",
  "Groups by interest",
  "Suggy",
  "Group signals",
  "Ebooku",
  "Member books",
  "De-Course",
  "Free courses",
  "Apps",
  "Member tools",
  "12 interests",
  "80% to pass",
  "48h vote",
  "90% creator share",
];

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {ITEMS.map((item, index) => (
        <span key={`${item}-${index}`} className="flex items-center">
          <span
            className={
              index % 2 === 0
                ? "px-5 text-xs font-medium tracking-tight text-zinc-200"
                : "px-5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400"
            }
          >
            {item}
          </span>
          <span className="h-1 w-1 rounded-full bg-emerald-400/70" />
        </span>
      ))}
    </div>
  );
}

export function TickerTape() {
  return (
    <section aria-hidden="true" className="landing-ticker border-y border-white/[0.08] bg-[#050505]">
      <div className="landing-mask-x overflow-hidden py-3.5">
        <div className="landing-ticker-track">
          <Row />
          <Row hidden />
        </div>
      </div>
    </section>
  );
}
