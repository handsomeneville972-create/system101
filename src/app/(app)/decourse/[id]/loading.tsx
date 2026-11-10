import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { TextCardSkeleton } from "@/components/ui/page-skeletons";

export default function CourseDetailLoading() {
  return (
    <LoadingRegion label="Loading course…" className="mx-auto max-w-3xl px-4 py-10">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 aspect-video w-full rounded-xl" />
      <TextCardSkeleton className="mt-5" rows={4} />
    </LoadingRegion>
  );
}
