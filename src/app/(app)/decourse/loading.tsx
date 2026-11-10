import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { CourseCardSkeleton } from "@/components/ui/skeletons";

export default function DeCourseLoading() {
  return (
    <LoadingRegion label="Loading courses…" className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <CourseCardSkeleton key={index} />
        ))}
      </div>
    </LoadingRegion>
  );
}
