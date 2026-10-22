import Link from "next/link";
import { Star } from "lucide-react";
import type { EbookListItem } from "@/lib/data/ebooks";

export function EbookCard({ ebook }: { ebook: EbookListItem }) {
  const price =
    ebook.price_cents === 0 ? "Free" : `$${(ebook.price_cents / 100).toFixed(2)}`;

  return (
    <Link href={`/ebooku/${ebook.id}`} className="card flex gap-4 p-4 hover:bg-white/[0.02]">
      <div className="h-24 w-16 shrink-0 overflow-hidden rounded-md border hairline bg-white/5">
        {ebook.cover_url ? (
          <img src={ebook.cover_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-zinc-600">
            No cover
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h2 className="truncate font-medium">{ebook.title}</h2>
          <span className="shrink-0 text-sm text-zinc-300">{price}</span>
        </div>
        <p className="mt-1 text-xs text-zinc-500">{ebook.author ?? "Unknown author"}</p>
        {ebook.description && (
          <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{ebook.description}</p>
        )}
        <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
          {ebook.rating_avg !== null ? (
            <span className="inline-flex items-center gap-1">
              <Star size={12} /> {ebook.rating_avg} ({ebook.rating_count})
            </span>
          ) : (
            <span>No ratings</span>
          )}
          {ebook.tags?.length ? <span>{ebook.tags.map((t) => `#${t}`).join(" ")}</span> : null}
        </div>
      </div>
    </Link>
  );
}
