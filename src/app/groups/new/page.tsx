import { CreateGroupForm } from "@/components/groups/CreateGroupForm";

export default function NewGroup() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Create group</h1>
      <p className="mt-1 text-sm text-zinc-400">Needs 2 invites accepted in 72h to activate.</p>
      <CreateGroupForm />
    </div>
  );
}
