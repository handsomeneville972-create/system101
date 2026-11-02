import { Reveal } from "@/components/landing/Reveal";

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <Reveal>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
          {eyebrow}
        </p>
      </Reveal>
      <Reveal delay={80}>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em] text-zinc-50 md:text-5xl">
          {title}
        </h2>
      </Reveal>
      {body ? (
        <Reveal delay={160}>
          <p
            className={`mt-4 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base ${
              align === "center" ? "mx-auto" : ""
            }`}
          >
            {body}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}
