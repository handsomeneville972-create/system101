import { Suspense } from "react";
import Link from "next/link";
import { EbookCard } from "@/components/ebooku/EbookCard";
import { LoadingRegion } from "@/components/ui/skeleton";
import { EbookCardSkeleton } from "@/components/ui/skeletons";
import { listEbooks, type EbookListItem, type PriceFilter } from "@/lib/data/ebooks";

export const instant = false;

const TABS: { key: PriceFilter; label: string; href: string }[] = [
  { key: "all", label: "All", href: "/ebooku" },
  { key: "free", label: "Free", href: "/ebooku?price=free" },
  { key: "paid", label: "Paid", href: "/ebooku?price=paid" },
];

async function EbookGrid({ books }: { books: Promise<EbookListItem[]> }) {
  const list = await books;

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {list.length === 0 && (
        <div className="card p-6 text-sm text-zinc-400">
          No books yet. Upload the first.
        </div>
      )}
      {list.map((b) => (
        <EbookCard key={b.id} ebook={b} />
      ))}
    </div>
  );
}

function EbookGridSkeleton() {
  return (
    <LoadingRegion label="Loading books…" className="mt-6 grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <EbookCardSkeleton key={index} />
      ))}
    </LoadingRegion>
  );
}

export default async function Ebooku({
  searchParams,
}: {
  searchParams: Promise<{ price?: string }>;
}) {
  const { price } = await searchParams;
  const filter: PriceFilter = price === "free" || price === "paid" ? price : "all";
  const books = listEbooks(filter);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ebooku</h1>
          <p className="text-sm text-zinc-400">Books from members. Free or paid. Read and review.</p>
        </div>
        <Link href="/ebooku/upload" className="btn-pill bg-white px-5 py-2.5 text-sm text-black">
          Upload
        </Link>
      </div>

      <div className="mt-5 flex gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`btn-pill border hairline px-4 py-1.5 text-xs ${
              filter === t.key ? "bg-white text-black" : "text-zinc-300 hover:bg-white/5"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <Suspense fallback={<EbookGridSkeleton />}>
        <EbookGrid books={books} />
      </Suspense>
    </div>
  );
}
