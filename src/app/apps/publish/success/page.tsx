import Link from "next/link";

export const instant = false;

export default async function PublishSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ app_id?: string }>;
}) {
  const { app_id } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Published!</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Your app is now live on the community directory.
      </p>
      {app_id && (
        <div className="mt-6">
          <Link
            href={`/apps/${app_id}`}
            className="btn-pill bg-white px-6 py-2.5 text-sm font-medium text-black"
          >
            View your app
          </Link>
        </div>
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
