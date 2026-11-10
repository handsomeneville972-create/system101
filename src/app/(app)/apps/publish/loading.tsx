import { FormPageSkeleton } from "@/components/ui/page-skeletons";

export default function PublishLoading() {
  return (
    <FormPageSkeleton
      label="Loading app form…"
      title="w-48"
      subtitle="w-80"
      fields={4}
    />
  );
}
