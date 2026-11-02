export function LandingBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="landing-grid absolute inset-0 opacity-60" />
      <div className="landing-aurora-a absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-emerald-500/10" />
      <div className="landing-aurora-b absolute -left-52 top-24 h-[420px] w-[420px] rounded-full bg-white/[0.05]" />
      <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_65%)]" />
      <div className="landing-noise absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black" />
    </div>
  );
}
