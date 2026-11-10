import { Skeleton, SkeletonCircle, SkeletonStatus } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";

export function AppCardSkeleton() {
  return (
    <div className="card flex min-h-32 gap-4 p-4" aria-hidden="true">
      <Skeleton className="h-24 w-24 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2 py-1">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function EbookCardSkeleton() {
  return (
    <div className="card flex min-h-32 gap-4 p-4" aria-hidden="true">
      <Skeleton className="h-24 w-16 shrink-0 rounded-md" />
      <div className="min-w-0 flex-1 space-y-2 py-1">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="card min-h-[156px] p-5" aria-hidden="true">
      <div className="flex items-start gap-3">
        <SkeletonCircle className="h-9 w-9 shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function SuggyCardSkeleton() {
  return (
    <div className="card flex min-h-[96px] items-center gap-4 p-4" aria-hidden="true">
      <div className="flex flex-col items-center gap-1">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-4 w-6" />
        <Skeleton className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-2/5" />
      </div>
    </div>
  );
}

export function GroupCardSkeleton() {
  return (
    <div className="card min-h-[88px] p-6" aria-hidden="true">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="mt-2 h-3 w-20" />
    </div>
  );
}

export function InterestCardSkeleton() {
  return (
    <div className="card min-h-[108px] p-6" aria-hidden="true">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-3 w-6" />
      </div>
      <Skeleton className="mt-3 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-4/5" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card min-h-[92px] p-4" aria-hidden="true">
      <Skeleton className="h-3 w-16" />
      <div className="mt-2 flex items-baseline justify-between gap-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-3 w-10" />
      </div>
      <Skeleton className="mt-2 h-3 w-24" />
    </div>
  );
}

export function ListCardSkeleton({
  rows = 4,
  className,
  label,
}: {
  rows?: number;
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn("card min-h-[156px] p-6", className)}
      aria-hidden={label ? undefined : true}
    >
      {label && <SkeletonStatus label={label} />}
      <Skeleton className="h-4 w-24" />
      <div className="mt-3 space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="card overflow-hidden" aria-hidden="true">
      <div className="flex items-center justify-between px-4 py-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-12" />
      </div>
      <div className="border-y hairline px-4 py-2">
        <div className="flex gap-3">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} className="h-3 flex-1" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-white/[0.06]">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="flex gap-3 px-4 py-3">
            {Array.from({ length: columns }).map((_, column) => (
              <Skeleton key={column} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormCardSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="card mt-6 space-y-4 p-6" aria-hidden="true">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      <Skeleton className="h-10 w-36 rounded-full" />
    </div>
  );
}
