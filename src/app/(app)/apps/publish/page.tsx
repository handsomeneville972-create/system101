import Link from "next/link";
import { getProfile } from "@/lib/auth";
import { AppUploadForm } from "@/components/apps/AppUploadForm";

export const instant = false;

export default async function PublishPage() {
  const profile = await getProfile();

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-zinc-400">Please <Link href="/?mode=signin" className="underline">sign in</Link> to share your app.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Share your app</h1>
      <p className="mt-1 text-sm text-zinc-400">Tell the community what you built. It takes a few minutes.</p>
      <AppUploadForm />
    </div>
  );
}
