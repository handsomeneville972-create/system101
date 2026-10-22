import { UploadForm } from "@/components/ebooku/UploadForm";

export const instant = false;

export default function UploadEbook() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Upload book</h1>
      <p className="text-sm text-zinc-400">
        Free = instant. Paid = 10% on sale, min $2.99. PDF/EPUB max 20MB.
      </p>
      <UploadForm />
    </div>
  );
}
