import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase-server";
import { PublishPayButton } from "@/components/apps/PublishPayButton";

export const instant = false;

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-zinc-400">
          Please{" "}
          <Link
            href={`/auth/sign-in?next=${encodeURIComponent(`/apps/publish/checkout/${id}`)}`}
            className="underline"
          >
            sign in
          </Link>{" "}
          to continue.
        </p>
      </div>
    );
  }

  const sb = await supabaseServer();
  const { data: app } = await sb
    .from("apps")
    .select("id,title,status,uploader_id")
    .eq("id", id)
    .maybeSingle();

  if (!app || app.uploader_id !== user.id) notFound();
  if (app.status === "published") redirect(`/apps/${app.id}`);
  if (app.status === "removed") notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Publish “{app.title}”</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Pay $4.99 to publish your app to the community. This is a one-time listing fee.
      </p>
      <div className="mt-6 card p-6">
        <p className="text-sm text-zinc-300">
          Your listing is currently a draft. Once payment succeeds, it will go live.
        </p>
        <PublishPayButton appId={app.id} />
      </div>
    </div>
  );
}
