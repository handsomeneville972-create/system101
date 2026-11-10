import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { LoadingRegion, Skeleton, SkeletonCircle } from "@/components/ui/skeleton";
import {
  FormCardSkeleton,
  ListCardSkeleton,
  StatCardSkeleton,
  TableSkeleton,
} from "@/components/ui/skeletons";

export function PageHeadingSkeleton({
  title = "w-48",
  subtitle = "w-72",
  action = false,
  className,
}: {
  title?: string;
  subtitle?: string;
  action?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="space-y-2">
        <Skeleton className={cn("h-8", title)} />
        <Skeleton className={cn("h-4", subtitle)} />
      </div>
      {action && <Skeleton className="h-10 w-28 rounded-full" />}
    </div>
  );
}

export function DetailHeroSkeleton({
  coverClassName = "h-40 w-40",
  title = "w-56",
}: {
  coverClassName?: string;
  title?: string;
}) {
  return (
    <div className="mt-4 flex gap-5" aria-hidden="true">
      <Skeleton className={cn("shrink-0 rounded-lg", coverClassName)} />
      <div className="min-w-0 flex-1 space-y-2 py-1">
        <Skeleton className={cn("h-8", title)} />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-3 h-10 w-36 rounded-full" />
      </div>
    </div>
  );
}

export function TextCardSkeleton({
  rows = 3,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("card mt-4 p-6", className)} aria-hidden="true">
      <Skeleton className="h-4 w-32" />
      <div className="mt-3 space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className={cn("h-3", index === rows - 1 ? "w-2/3" : "w-full")} />
        ))}
      </div>
    </div>
  );
}

export function StatRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <StatCardSkeleton key={index} />
      ))}
    </div>
  );
}

function PageFrame({
  label,
  maxWidth,
  children,
}: {
  label: string;
  maxWidth: string;
  children: ReactNode;
}) {
  return (
    <LoadingRegion label={label} className={cn("mx-auto px-4 py-10", maxWidth)}>
      {children}
    </LoadingRegion>
  );
}

export function FormPageSkeleton({
  label = "Loading form…",
  maxWidth = "max-w-2xl",
  title = "w-48",
  subtitle = "w-72",
  fields = 4,
}: {
  label?: string;
  maxWidth?: string;
  title?: string;
  subtitle?: string;
  fields?: number;
}) {
  return (
    <PageFrame label={label} maxWidth={maxWidth}>
      <PageHeadingSkeleton title={title} subtitle={subtitle} />
      <FormCardSkeleton fields={fields} />
    </PageFrame>
  );
}

export function SettingsPageSkeleton() {
  return (
    <PageFrame label="Loading settings…" maxWidth="max-w-2xl">
      <PageHeadingSkeleton title="w-32" subtitle="w-0" />
      <div className="card mt-6 p-6" aria-hidden="true">
        <Skeleton className="h-4 w-16" />
        <div className="mt-4 flex items-center gap-4">
          <SkeletonCircle className="h-16 w-16" />
          <Skeleton className="h-9 w-32 rounded-full" />
        </div>
      </div>
      <FormCardSkeleton fields={5} />
    </PageFrame>
  );
}

export function TablePageSkeleton({
  label = "Loading table…",
  maxWidth = "max-w-5xl",
  title = "w-40",
  subtitle = "w-80",
  stats = 0,
  rows = 5,
  columns = 5,
}: {
  label?: string;
  maxWidth?: string;
  title?: string;
  subtitle?: string;
  stats?: number;
  rows?: number;
  columns?: number;
}) {
  return (
    <PageFrame label={label} maxWidth={maxWidth}>
      <PageHeadingSkeleton title={title} subtitle={subtitle} />
      {stats > 0 && (
        <div className="mt-6">
          <StatRowSkeleton count={stats} />
        </div>
      )}
      <div className="mt-6">
        <TableSkeleton rows={rows} columns={columns} />
      </div>
    </PageFrame>
  );
}

export function ListRowsSkeleton({
  rows = 4,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("card mt-4 overflow-hidden", className)} aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-start gap-3 border-b hairline p-4 last:border-0">
          <Skeleton className="mt-0.5 h-8 w-8 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListPageSkeleton({
  label = "Loading…",
  maxWidth = "max-w-3xl",
  title = "w-40",
  subtitle = "w-80",
  rows = 3,
}: {
  label?: string;
  maxWidth?: string;
  title?: string;
  subtitle?: string;
  rows?: number;
}) {
  return (
    <PageFrame label={label} maxWidth={maxWidth}>
      <PageHeadingSkeleton title={title} subtitle={subtitle} />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {Array.from({ length: rows }).map((_, index) => (
          <ListCardSkeleton key={index} rows={3} />
        ))}
      </div>
    </PageFrame>
  );
}
