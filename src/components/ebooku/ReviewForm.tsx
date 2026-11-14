"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Stars } from "@/components/ui/stars";
import { createReview, deleteReview, type FormState } from "@/lib/actions/ebooks";
import type { EbookReview } from "@/lib/data/ebooks";

const initial: FormState = {};
const MAX_BODY = 2000;

function SubmitButton({ editing, disabled }: { editing: boolean; disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className="btn-pill bg-white px-5 py-2 text-xs font-medium text-black disabled:opacity-50"
    >
      {pending ? "Saving…" : editing ? "Save changes" : "Post review"}
    </button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}

function ReviewEditor({
  ebookId,
  myReview,
  onSaved,
  onCancel,
}: {
  ebookId: string;
  myReview: EbookReview | null;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const [rating, setRating] = useState(myReview?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [state, action] = useActionState(
    async (prev: FormState, formData: FormData) => {
      const result = await createReview(prev, formData);
      if (result.ok) onSaved();
      return result;
    },
    initial
  );
  const shown = hover || rating;

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="ebook_id" value={ebookId} />

      <fieldset>
        <legend className="text-xs text-zinc-400">Your rating</legend>
        <div className="mt-1 flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              onMouseEnter={() => setHover(n)}
              className="cursor-pointer rounded-md p-0.5 focus-within:ring-2 focus-within:ring-white/40"
            >
              <input
                type="radio"
                name="rating"
                value={n}
                checked={rating === n}
                onChange={() => setRating(n)}
                onFocus={() => setHover(n)}
                onBlur={() => setHover(0)}
                className="sr-only"
              />
              <Star
                size={22}
                aria-hidden="true"
                className={n <= shown ? "fill-white text-white" : "text-zinc-600"}
              />
              <span className="sr-only">
                {n} star{n === 1 ? "" : "s"}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="review-body" className="sr-only">
          Review
        </label>
        <textarea
          id="review-body"
          name="body"
          rows={3}
          maxLength={MAX_BODY}
          defaultValue={myReview?.body ?? ""}
          placeholder="What did you think? Optional."
          className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-xs text-red-400">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton editing={!!myReview} disabled={rating < 1} />
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function DeleteReviewForm({
  reviewId,
  onDeleted,
  onCancel,
}: {
  reviewId: string;
  onDeleted: () => void;
  onCancel: () => void;
}) {
  const [state, action] = useActionState(
    async (prev: FormState, formData: FormData) => {
      const result = await deleteReview(prev, formData);
      if (result.ok) onDeleted();
      return result;
    },
    initial
  );

  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="review_id" value={reviewId} />
      <span role="alert" className="text-xs text-zinc-400">
        Delete this review?
      </span>
      <DeleteButton />
      <button
        type="button"
        onClick={onCancel}
        className="text-xs text-zinc-500 hover:text-zinc-300"
      >
        Cancel
      </button>
      {state.error && (
        <p role="alert" className="w-full text-xs text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}

export function ReviewForm({
  ebookId,
  myReview,
  reviewDate,
}: {
  ebookId: string;
  myReview: EbookReview | null;
  reviewDate: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (!myReview || editing) {
    return (
      <ReviewEditor
        key={myReview?.id ?? "new"}
        ebookId={ebookId}
        myReview={myReview}
        onSaved={() => {
          setEditing(false);
          router.refresh();
        }}
        onCancel={myReview ? () => setEditing(false) : undefined}
      />
    );
  }

  return (
    <article className="rounded-xl border hairline bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-400">
          Your review
        </span>
        <time dateTime={myReview.created_at} className="text-xs text-zinc-500">
          {reviewDate}
        </time>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Stars rating={myReview.rating} size={13} />
        <span className="text-xs text-zinc-500">{myReview.rating}/5</span>
        {myReview.verified_purchase && (
          <span className="rounded-full border hairline px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-400">
            Verified
          </span>
        )}
      </div>

      {myReview.body && (
        <p className="mt-2 whitespace-pre-line text-sm text-zinc-300">{myReview.body}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs text-zinc-300 hover:text-white"
        >
          Edit
        </button>

        {confirming ? (
          <DeleteReviewForm
            reviewId={myReview.id}
            onDeleted={() => {
              setConfirming(false);
              router.refresh();
            }}
            onCancel={() => setConfirming(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="text-xs text-zinc-500 hover:text-red-400"
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
}
