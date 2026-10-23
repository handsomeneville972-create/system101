import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/auth";
import { appDetail } from "@/lib/data/apps";
import { removeApp } from "@/lib/actions/apps";

export const instant = false;

export default async function AppPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const app = await appDetail(id);
  const user = await getUser();
  if (!app) notFound();
  if (app.status !== "published" && app.uploader_id !== user?.id) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/apps" className="text-xs text-zinc-500 hover:text-zinc-300">
        ← Community Apps
      </Link>

      <div className="mt-4 flex gap-5">
        <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-lg border hairline bg-white/5">
          {app.icon_url ? (
            <Image
              src={app.icon_url}
              alt={app.title}
              fill
              unoptimized
              sizes="160px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] text-zinc-600">
              No icon
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">{app.title}</h1>
          <p className="mt-1 text-sm text-zinc-400">{app.author ?? "Unknown developer"}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
            {app.category && <span>#{app.category}</span>}
            {app.tags?.map((t) => <span key={t}>#{t}</span>)}
          </div>
          {app.tagline && (
            <p className="mt-2 text-sm text-zinc-300">{app.tagline}</p>
          )}

          <div className="mt-4">
            {(app.website_url || app.repo_url) && (
              <a
                href={app.website_url || app.repo_url || "#"}
                target="_blank"
                rel="noopener"
                className="btn-pill inline-flex items-center gap-2 bg-white px-6 py-2.5 text-sm font-medium text-black"
              >
                Visit app
              </a>
            )}
            {app.is_uploader && (
              <form action={removeApp} className="mt-3">
                <input type="hidden" name="app_id" value={app.id} />
                <button className="text-xs text-zinc-500 hover:text-red-400">
                  Remove listing
                </button>
              </form>
            )}
          </div>

          {app.is_uploader && app.status === "draft" && (
            <div className="mt-3 p-3 rounded-md border hairline bg-white/[0.02] text-xs text-zinc-400">
              Listing is a draft — pay $4.99 to publish it to the community.
            </div>
          )}
        </div>
      </div>

      {app.developer_bio && (
        <div className="card mt-6 p-6">
          <h2 className="text-sm font-medium">About the developer</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-zinc-400">{app.developer_bio}</p>
        </div>
      )}

      {app.description && (
        <div className="card mt-4 p-6">
          <h2 className="text-sm font-medium">About this app</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-zinc-400">{app.description}</p>
        </div>
      )}

      {(app.alternative_to || app.license || app.repo_url || app.contact_email) && (
        <div className="card mt-4 p-6">
          <h2 className="text-sm font-medium">Details</h2>
          <ul className="mt-2 space-y-1 text-sm text-zinc-400">
            {app.alternative_to && <li>Alternative to: {app.alternative_to}</li>}
            {app.license && <li>License: {app.license}</li>}
            {app.repo_url && (
              <li>
                Repository:{" "}
                <a href={app.repo_url} target="_blank" rel="noopener" className="text-zinc-300 underline">
                  {app.repo_url}
                </a>
              </li>
            )}
            {app.contact_email && <li>Contact: {app.contact_email}</li>}
          </ul>
        </div>
      )}

      {app.screenshot_urls.length > 0 && (
        <div className="card mt-6 p-6">
          <h2 className="text-sm font-medium">Screenshots</h2>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {app.screenshot_urls.map((url, i) => (
              <div
                key={i}
                className="relative h-32 w-full overflow-hidden rounded-md border hairline"
              >
                <Image
                  src={url}
                  alt={`${app.title} screenshot ${i + 1}`}
                  fill
                  unoptimized
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
