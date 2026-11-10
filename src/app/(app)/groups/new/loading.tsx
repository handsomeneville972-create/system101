import { FormPageSkeleton } from "@/components/ui/page-skeletons";

export default function NewGroupLoading() {
  return (
    <FormPageSkeleton
      label="Loading group form…"
      title="w-44"
      subtitle="w-72"
      fields={3}
    />
  );
}
