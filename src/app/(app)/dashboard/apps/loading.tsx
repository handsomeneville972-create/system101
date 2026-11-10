import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { StatCardSkeleton, TableSkeleton } from "@/components/ui/skeletons";
import { PageHeadingSkeleton } from "@/components/ui/page-skeletons";

export default function DashboardAppsLoading() {
  return (
    <LoadingRegion label="Loading app analytics…" className="mx-auto max-w-6xl px-4 py-10">
      <PageHeadingSkeleton title="w-44" subtitle="w-64" action />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="card min-h-[220px] w-full" />
        <Skeleton className="card min-h-[220px] w-full" />
        <Skeleton className="card min-h-[220px] w-full" />
      </div>
      <div className="mt-4">
        <TableSkeleton rows={5} columns={5} />
      </div>
    </LoadingRegion>
  );
}
