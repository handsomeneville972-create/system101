import Link from "next/link";
import { DonateButton } from "@/components/DonateButton";

export default function Ebooku() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ebooku</h1>
          <p className="text-sm text-zinc-400">Free to share. Paid = 10% on sale. Reviews.</p>
        </div>
        <Link href="/ebooku/upload" className="btn-pill bg-white px-5 py-2.5 text-sm text-black">Upload</Link>
      </div>
      <div className="card mt-6 p-6 text-sm text-zinc-400">No books yet. Upload first.</div>
      <div className="mt-6"><DonateButton surface="ebooku" /></div>
    </div>
  );
}
