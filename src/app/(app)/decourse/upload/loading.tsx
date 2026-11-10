import { FormPageSkeleton } from "@/components/ui/page-skeletons";

export default function UploadCourseLoading() {
  return (
    <FormPageSkeleton
      label="Loading upload form…"
      title="w-40"
      subtitle="w-80"
      fields={3}
    />
  );
}
