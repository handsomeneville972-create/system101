import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { ReviewForm } from "@/components/ebooku/ReviewForm";
import { Avatar } from "@/components/ui/avatar";
import { Stars } from "@/components/ui/stars";
import { shortDate } from "@/lib/money";
import type { EbookReview } from "@/lib/data/ebooks";

export function ReviewsSection({
  ebookId,
  reviews,
  myReview,
  ratingAvg,
  ratingCount,
  signedIn,
}: {
  ebookId: string;
  reviews: EbookReview[];
  myReview: EbookReview | null;
  ratingAvg: number | null;
  ratingCount: number;
  signedIn: boolean;
}) {
  const others = myReview ? reviews.filter((r) => r.id !== myReview.id) : reviews;
  const buckets = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
  }));

  return (
    <section className="card mt-4 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-medium">Reviews</h2>
          {ratingAvg !== null ? (
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Stars rating={ratingAvg} size={14} />
              <span className="text-sm font-medium text-zinc-200">{ratingAvg}</span>
              <span className="text-xs text-zinc-500">
                {ratingCount} {ratingCount === 1 ? "review" : "reviews"}
              </span>
            </div>
          ) : (
            <p className="mt-1.5 text-sm text-zinc-500">No reviews yet.</p>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="w-full space-y-1.5 sm:max-w-[220px]" aria-hidden="true">
            {buckets.map(({ rating, count }) => (
              <div key={rating} className="flex items-center gap-2 text-[11px] text-zinc-500">
                <span className="w-3 text-right tabular-nums">{rating}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-white/40"
                    style={{ width: `${(count / reviews.length) * 100}%` }}
                  />
                </div>
                <span className="w-5 tabular-nums">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 border-t hairline pt-5">
        {signedIn ? (
          <ReviewForm
            ebookId={ebookId}
            myReview={myReview}
            reviewDate={myReview ? shortDate(myReview.created_at) : null}
          />
        ) : (
          <p className="text-sm text-zinc-500">
            <Link
              href={`/?mode=signin&next=/ebooku/${ebookId}`}
              className="text-zinc-300 underline"
            >
              Sign in
            </Link>{" "}
            to review this book.
          </p>
        )}
      </div>

      {others.length > 0 && (
        <ul className="mt-6 space-y-5 border-t hairline pt-5">
          {others.map((review) => (
            <li key={review.id} className="flex gap-3">
              <Avatar name={review.author} size="sm" />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/u/${review.user_id}`}
                      className="text-sm text-zinc-200 hover:text-white"
                    >
                      {review.author ?? "Reader"}
                    </Link>
                    {review.verified_purchase && (
                      <span className="inline-flex items-center gap-1 rounded-full border hairline px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-400">
                        <BadgeCheck size={11} aria-hidden="true" />
                        Verified
                      </span>
                    )}
                  </div>
                  <time dateTime={review.created_at} className="text-xs text-zinc-500">
                    {shortDate(review.created_at)}
                  </time>
                </div>

                <div className="mt-1 flex items-center gap-2">
                  <Stars rating={review.rating} size={12} />
                  <span className="text-xs text-zinc-500">{review.rating}/5</span>
                </div>

                {review.body && (
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-400">
                    {review.body}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
