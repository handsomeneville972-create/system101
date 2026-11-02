import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Star } from "lucide-react";
import { BuyButton } from "@/components/ebooku/BuyButton";
import { ReviewForm } from "@/components/ebooku/ReviewForm";
import { ebookDetail } from "@/lib/data/ebooks";
import { getProfile } from "@/lib/auth";
import { removeEbook } from "@/lib/actions/ebooks";

export const instant = false;

export default async function EbookPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ bought?: string }>;
}) {
  const { id } = await params;
  const { bought } = await searchParams;
  const ebook = await ebookDetail(id);
  if (!ebook) notFound();
  const profile = await getProfile();

  const price =
    ebook.price_cents === 0 ? "Free" : `$${(ebook.price_cents / 100).toFixed(2)}`;
  const canDownload = ebook.owned || ebook.is_uploader;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/ebooku" className="text-xs text-zinc-500 hover:text-zinc-300">
        ← Ebooku
      </Link>

      {bought === "1" && !ebook.owned && (
        <div className="card mt-4 p-4 text-sm text-zinc-300">
          Payment received. If the book is not unlocked yet, refresh in a few seconds.
        </div>
      )}

      <div className="mt-4 flex gap-5">
        <div className="relative h-40 w-28 shrink-0 overflow-hidden rounded-lg border hairline bg-white/5">
          {ebook.cover_url ? (
            <Image
              src={ebook.cover_url}
              alt={ebook.title}
              fill
              unoptimized
              sizes="112px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] text-zinc-600">
              No cover
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">{ebook.title}</h1>
          <p className="mt-1 text-sm text-zinc-400">{ebook.author ?? "Unknown author"}</p>
          <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
            <span className="text-sm text-zinc-200">{price}</span>
            {ebook.rating_avg !== null ? (
              <span className="inline-flex items-center gap-1">
                <Star size={12} /> {ebook.rating_avg} ({ebook.rating_count})
              </span>
            ) : (
              <span>No ratings</span>
            )}
            {ebook.tags?.length ? <span>{ebook.tags.map((t) => `#${t}`).join(" ")}</span> : null}
          </div>

          <div className="mt-4">
            {canDownload ? (
              <a
                href={`/ebooku/${ebook.id}/download`}
                className="btn-pill inline-flex items-center gap-2 bg-white px-6 py-2.5 text-sm font-medium text-black"
              >
                <Download size={15} /> Download
              </a>
            ) : (
              <BuyButton ebookId={ebook.id} label={`Buy ${price}`} />
            )}
          </div>

          {ebook.is_uploader && (
            <form action={removeEbook} className="mt-3">
              <input type="hidden" name="ebook_id" value={ebook.id} />
              <button className="text-xs text-zinc-500 hover:text-red-400">Remove listing</button>
            </form>
          )}
        </div>
      </div>

      {ebook.description && (
        <div className="card mt-6 p-6">
          <h2 className="text-sm font-medium">About this book</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-zinc-400">{ebook.description}</p>
        </div>
      )}

      {ebook.author_bio && (
        <div className="card mt-4 p-6">
          <h2 className="text-sm font-medium">About the author</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-zinc-400">{ebook.author_bio}</p>
        </div>
      )}

      <div className="card mt-4 p-6">
        <h2 className="text-sm font-medium">Reviews</h2>
        {ebook.reviews.length === 0 && (
          <p className="mt-2 text-sm text-zinc-500">No reviews yet.</p>
        )}
        <ul className="mt-3 space-y-4">
          {ebook.reviews.map((r) => (
            <li key={r.id} className="border-t hairline pt-3 first:border-0 first:pt-0">
              <div className="flex items-center justify-between">
                <span className="text-sm">{r.author ?? "Reader"}</span>
                <span className="text-xs text-zinc-500">
                  {r.rating} ★{r.verified_purchase ? " · verified" : ""}
                </span>
              </div>
              {r.body && <p className="mt-1 text-sm text-zinc-400">{r.body}</p>}
            </li>
          ))}
        </ul>

        <div className="mt-5 border-t hairline pt-4">
          {profile ? (
            <ReviewForm
              ebookId={ebook.id}
              myRating={ebook.my_review?.rating ?? null}
              myBody={ebook.my_review?.body ?? null}
            />
          ) : (
            <Link
              href={`/auth/sign-in?next=/ebooku/${ebook.id}`}
              className="text-sm text-zinc-300 underline"
            >
              Sign in to review
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
