import type { Metadata } from "next";
import { Avatar } from "@/components/ui/avatar";
import { SkeletonOctagon } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Octagonal avatar preview",
  robots: { index: false, follow: false },
};

const svg = (width: number, height: number, from: string, to: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) / 4}" fill="rgba(0,0,0,.35)"/>
      <text x="50%" y="52%" text-anchor="middle" font-family="sans-serif" font-size="${Math.min(width, height) / 5}" fill="white">${width}x${height}</text>
    </svg>`
  )}`;

const wide = svg(400, 200, "#52525b", "#18181b");
const tall = svg(200, 400, "#0f766e", "#042f2e");
const square = svg(320, 320, "#7c3aed", "#2e1065");

const sizes = [
  { label: "XS · 28px", size: "xs" as const },
  { label: "SM · 32px", size: "sm" as const },
  { label: "MD · 40px", size: "md" as const },
  { label: "LG · 64px", size: "lg" as const },
  { label: "XL · 96px", size: "xl" as const },
  { label: "Custom · 80px", size: 80 },
];

export default function OctagonPreview() {
  return (
    <main className="mx-auto max-w-4xl space-y-10 px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold">Octagonal avatar preview</h1>
        <p className="mt-1 text-sm text-zinc-500">
          QA surface for sizes, aspect ratios, fallbacks, and overlays.
        </p>
      </div>

      <section>
        <h2 className="mb-4 text-sm text-zinc-400">Sizes · square image</h2>
        <div className="flex flex-wrap items-end gap-5">
          {sizes.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2">
              <Avatar
                name="Ada Lovelace"
                src={square}
                alt="Ada Lovelace"
                size={item.size}
              />
              <span className="text-[10px] text-zinc-500">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm text-zinc-400">Aspect ratios · 96 px</h2>
        <div className="flex flex-wrap gap-6">
          {[
            { label: "Wide 400×200", src: wide },
            { label: "Tall 200×400", src: tall },
            { label: "Square 320×320", src: square },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2">
              <Avatar
                name={item.label}
                src={item.src}
                alt={item.label}
                size="xl"
              />
              <span className="text-[10px] text-zinc-500">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm text-zinc-400">
          Fallbacks, status, verification, outlines
        </h2>
        <div className="flex flex-wrap items-center gap-8">
          <Avatar name="Grace Hopper" size="lg" />
          <Avatar
            name="Katherine Johnson"
            size="lg"
            fallback={
              <span className="px-1 text-center text-[10px] text-zinc-500">
                No photo
              </span>
            }
          />
          <Avatar name="Unknown member" size="lg" outline={false} />
          <Avatar
            name="Margaret Hamilton"
            src={square}
            size="lg"
            status="online"
            verified
          />
          <Avatar
            name="Dorothy Vaughan"
            size="lg"
            status="away"
          />
          <Avatar
            name="Mary Jackson"
            size="lg"
            status="offline"
            verified
            href="#avatar"
          />
          <SkeletonOctagon className="h-16 w-16" />
        </div>
      </section>
    </main>
  );
}
