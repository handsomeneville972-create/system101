import { CreateGroupForm } from "@/components/groups/CreateGroupForm";
import { INTERESTS } from "@/lib/domain";

export const instant = false;

export default async function NewGroup({
  searchParams,
}: {
  searchParams: Promise<{ interest?: string }>;
}) {
  const { interest } = await searchParams;
  const defaultInterest = INTERESTS.some((i) => i.slug === interest) ? interest : "";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Create group</h1>
      <p className="mt-1 text-sm text-zinc-400">Needs 2 members to join in 72h to activate.</p>
      <CreateGroupForm defaultInterest={defaultInterest} />
    </div>
  );
}
