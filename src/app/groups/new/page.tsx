export default function NewGroup() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Create group</h1>
      <p className="text-sm text-zinc-400">Needs 2 invites accepted in 72h to activate.</p>
      <form className="card mt-6 space-y-4 p-6">
        <input required placeholder="Group name" className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm" />
        <input required placeholder="Invite email 1" type="email" className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm" />
        <input required placeholder="Invite email 2" type="email" className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm" />
        <textarea placeholder="Rules" rows={3} className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm" />
        <button className="btn-pill bg-white px-6 py-2.5 text-sm text-black">Send invites</button>
      </form>
    </div>
  );
}
