import { FormPageSkeleton } from "@/components/ui/page-skeletons";

export default function UploadEbookLoading() {
  return (
    <FormPageSkeleton
      label="Loading upload form…"
      title="w-40"
      subtitle="w-96"
      fields={3}
    />
  );
}
