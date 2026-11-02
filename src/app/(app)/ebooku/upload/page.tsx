import { UploadForm } from "@/components/ebooku/UploadForm";

export const instant = false;

export default function UploadEbook() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Upload book</h1>
      <p className="text-sm text-zinc-400">
        Share your book. Free or paid — you keep 90% of every sale. PDF/EPUB up to 20MB.
      </p>
      <UploadForm />
    </div>
  );
}
