import Link from "next/link";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const instant = false;

type Params = { reference?: string; trxref?: string; app_id?: string };

export default async function PublishSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const sp = await searchParams;
  const reference = sp.reference ?? sp.trxref ?? "";
  const user = await getUser();

  let appId = sp.app_id ?? null;
  let paymentStatus: string | null = null;

  if (user && reference) {
    const admin = supabaseAdmin();
    const { data: payment } = await admin
      .from("payments")
      .select("app_id,status,buyer_id")
      .eq("reference", reference)
      .maybeSingle();
    if (payment && payment.buyer_id === user.id && payment.app_id) {
      appId = payment.app_id;
      paymentStatus = payment.status;
    }
  }

  let appStatus: string | null = null;
  let appTitle: string | null = null;
  if (user && appId) {
    const admin = supabaseAdmin();
    const { data: app } = await admin
      .from("apps")
      .select("title,status,uploader_id")
      .eq("id", appId)
      .maybeSingle();
    if (app && app.uploader_id === user.id) {
      appStatus = app.status;
      appTitle = app.title;
    }
  }

  const live = appStatus === "published";
  const failed = paymentStatus === "failed";
  const processing =
    !live && !failed && (paymentStatus === "pending" || paymentStatus === "success");

  const refreshHref = reference
    ? `/apps/publish/success?reference=${encodeURIComponent(reference)}`
    : "/apps/publish/success";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">
        {live ? "You’re live." : failed ? "Payment didn’t complete." : processing ? "Payment received." : "Listing status"}
      </h1>
      <p className="mt-1 text-sm text-zinc-400">
        {live
          ? "Your app is in the directory. Share the link anywhere."
          : failed
            ? "Your listing is still a draft. You can try the payment again."
            : processing
              ? "We’re publishing your listing. This usually takes a few seconds."
              : "We couldn’t confirm a payment for this listing. Open My apps to check its status."}
      </p>

      {live && appId && (
        <div className="mt-6">
          <Link
            href={`/apps/${appId}`}
            className="btn-pill bg-white px-6 py-2.5 text-sm font-medium text-black"
          >
            View your app
          </Link>
        </div>
      )}

      {processing && (
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={refreshHref}
            className="btn-pill bg-white px-6 py-2.5 text-sm font-medium text-black"
          >
            Refresh
          </Link>
          <Link
            href="/dashboard/apps"
            className="btn-pill border hairline px-6 py-2.5 text-sm text-zinc-300 hover:text-white"
          >
            My apps
          </Link>
        </div>
      )}

      {failed && appId && (
        <div className="mt-6">
          <Link
            href={`/apps/publish/checkout/${appId}`}
            className="btn-pill bg-white px-6 py-2.5 text-sm font-medium text-black"
          >
            Try again
          </Link>
        </div>
      )}

      {!live && !processing && !failed && (
        <div className="mt-6">
          <Link
            href="/dashboard/apps"
            className="btn-pill bg-white px-6 py-2.5 text-sm font-medium text-black"
          >
            My apps
          </Link>
        </div>
      )}

      {live && appTitle && (
        <p className="mt-4 text-xs text-zinc-500">{appTitle}</p>
      )}

      <Link
        href="/apps"
        className="mt-4 inline-block text-xs text-zinc-400 hover:text-zinc-300"
      >
        ← Back to Community Apps
      </Link>
    </div>
  );
}
