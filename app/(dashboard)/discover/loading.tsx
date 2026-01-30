import { PropertyGridSkeleton } from "@/components/skeletons/property-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function DiscoverLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-5 w-72" />
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-20" />
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <div className="hidden w-64 shrink-0 lg:block">
          <div className="space-y-4 rounded-lg border bg-white p-4">
            <Skeleton className="h-6 w-16" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
          <PropertyGridSkeleton count={6} />
        </div>
      </div>
    </div>
  );
}
