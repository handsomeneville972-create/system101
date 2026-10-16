export default async function GroupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">{slug}</h1>
      <p className="text-sm text-zinc-400">Enter with reason. Members vote 80% in 48h.</p>
      <form className="card mt-6 space-y-4 p-6">
        <textarea required minLength={50} placeholder="Why should you join? (min 50 chars)"
          rows={4} className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm" />
        <button className="btn-pill bg-white px-6 py-2.5 text-sm text-black">Request to join</button>
      </form>
      <div className="card mt-6 p-6 text-sm text-zinc-400">
        Leader can create Suggy: title + desc + hashtags. Draft or delete if vote fails.
      </div>
    </div>
  );
}
