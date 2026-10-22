"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createReview, type FormState } from "@/lib/actions/ebooks";

const initial: FormState = {};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="btn-pill bg-white px-5 py-2 text-xs font-medium text-black disabled:opacity-50"
    >
      {pending ? "Saving…" : "Submit review"}
    </button>
  );
}

export function ReviewForm({
  ebookId,
  myRating,
  myBody,
}: {
  ebookId: string;
  myRating: number | null;
  myBody: string | null;
}) {
  const [state, action] = useActionState(createReview, initial);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="ebook_id" value={ebookId} />
      <div className="flex items-center gap-3">
        <label className="text-xs text-zinc-400">Rating</label>
        <select
          name="rating"
          defaultValue={String(myRating ?? 5)}
          className="rounded-md border hairline bg-black px-2 py-1 text-sm"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} ★
            </option>
          ))}
        </select>
      </div>
      <textarea
        name="body"
        rows={3}
        defaultValue={myBody ?? ""}
        placeholder="What did you think?"
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      />
      {state.error && <p className="text-xs text-red-400">{state.error}</p>}
      {state.ok && <p className="text-xs text-zinc-400">Saved.</p>}
      <Submit />
    </form>
  );
}
