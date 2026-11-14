import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyButton } from "@/components/ebooku/BuyButton";
import { ReviewsSection } from "@/components/ebooku/ReviewsSection";
import { DownloadButton } from "@/components/ui/download-button";
import { Stars } from "@/components/ui/stars";
import { SubmitButton } from "@/components/ui/submit-button";
import { ebookDetail } from "@/lib/data/ebooks";
import { getProfile } from "@/lib/auth";
import { removeEbook } from "@/lib/actions/ebooks";
import { usd } from "@/lib/money";

export const instant = false;

export default async function EbookPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ bought?: string; reference?: string; trxref?: string }>;
}) {
  const { id } = await params;
  const { bought, reference, trxref } = await searchParams;
  const returned = bought === "1" || Boolean(reference || trxref);
  const ebook = await ebookDetail(id);
  if (!ebook) notFound();
  const profile = await getProfile();

  const price = ebook.price_cents === 0 ? "Free" : usd(ebook.price_cents);
  const canDownload = ebook.owned || ebook.is_uploader;
  const format = ebook.file_path?.split(".").pop()?.toUpperCase() ?? null;
  const authorHref = ebook.uploader_id ? `/u/${ebook.uploader_id}` : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/ebooku" className="text-xs text-zinc-500 hover:text-zinc-300">
        ← Ebooku
      </Link>

      {returned && !ebook.owned && (
        <div className="card mt-4 p-4 text-sm text-zinc-300">
          Payment received. If the book is not unlocked yet, refresh in a few seconds.
        </div>
      )}

      <header className="card mt-4 p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="relative mx-auto aspect-[2/3] w-32 shrink-0 overflow-hidden rounded-lg border hairline bg-white/5 sm:mx-0 sm:w-44">
            {ebook.cover_url ? (
              <Image
                src={ebook.cover_url}
                alt={ebook.title}
                fill
                unoptimized
                sizes="(min-width: 640px) 176px, 128px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[10px] text-zinc-600">
                No cover
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {ebook.title}
                </h1>
                <p className="mt-1 text-sm text-zinc-400">
                  {authorHref ? (
                    <Link href={authorHref} className="hover:text-zinc-200">
                      {ebook.author ?? "Unknown author"}
                    </Link>
                  ) : (
                    ebook.author ?? "Unknown author"
                  )}
                </p>
              </div>
              <span className="btn-pill shrink-0 border hairline bg-white/[0.04] px-3 py-1 text-xs text-zinc-200">
                {price}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500">
              {ebook.rating_avg !== null ? (
                <span className="inline-flex items-center gap-2">
                  <Stars rating={ebook.rating_avg} size={13} />
                  <span className="text-zinc-300">{ebook.rating_avg}</span>
                  <span>({ebook.rating_count})</span>
                </span>
              ) : (
                <span>No ratings yet</span>
              )}
              {format && <span>{format}</span>}
            </div>

            {ebook.tags?.length ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {ebook.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border hairline px-2.5 py-0.5 text-[11px] text-zinc-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-5">
              {canDownload ? (
                <DownloadButton endpoint={`/ebooku/${ebook.id}/download`} />
              ) : (
                <BuyButton ebookId={ebook.id} label={`Buy ${price}`} />
              )}
              {ebook.owned && ebook.price_cents > 0 && (
                <p className="mt-2 text-xs text-zinc-500">You own this book.</p>
              )}
              {ebook.is_uploader && (
                <p className="mt-2 text-xs text-zinc-500">Your listing.</p>
              )}
            </div>

            {ebook.is_uploader && (
              <form action={removeEbook} className="mt-3">
                <input type="hidden" name="ebook_id" value={ebook.id} />
                <SubmitButton
                  pendingText="Removing…"
                  className="text-xs text-zinc-500 hover:text-red-400"
                >
                  Remove listing
                </SubmitButton>
              </form>
            )}
          </div>
        </div>
      </header>

      {ebook.description && (
        <section className="card mt-4 p-5 sm:p-6">
          <h2 className="text-sm font-medium">About this book</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-400">
            {ebook.description}
          </p>
        </section>
      )}

      {ebook.author_bio && (
        <section className="card mt-4 p-5 sm:p-6">
          <h2 className="text-sm font-medium">About the author</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-400">
            {ebook.author_bio}
          </p>
        </section>
      )}

      <ReviewsSection
        ebookId={ebook.id}
        reviews={ebook.reviews}
        myReview={ebook.my_review}
        ratingAvg={ebook.rating_avg}
        ratingCount={ebook.rating_count}
        signedIn={!!profile}
      />
    </div>
  );
}
