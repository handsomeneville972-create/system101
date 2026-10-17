export default function UploadEbook() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Upload book</h1>
      <p className="text-sm text-zinc-400">Free = instant. Paid = Paystack on sale, 10% fee, min $2.99. PDF/EPUB max 20MB.</p>
      <form className="card mt-6 space-y-4 p-6">
        <input required placeholder="Title" className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm" />
        <textarea required placeholder="Book description" rows={4} className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm" />
        <textarea required placeholder="About author" rows={3} className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm" />
        <div className="flex gap-3">
          <input placeholder="Price USD (blank = free)" className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm" />
          <input type="file" accept=".pdf,.epub" className="w-full text-sm text-zinc-400" />
        </div>
        <label className="flex items-center gap-2 text-xs text-zinc-400">
          <input type="checkbox" required /> I own rights. Accept DMCA takedown.
        </label>
        <button className="btn-pill bg-white px-6 py-2.5 text-sm text-black">Publish</button>
      </form>
    </div>
  );
}
