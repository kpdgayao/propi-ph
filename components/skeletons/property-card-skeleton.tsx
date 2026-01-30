import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Photo skeleton */}
      <Skeleton className="aspect-[4/3] w-full rounded-none" />

      <CardHeader className="p-4 pb-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="mt-2 h-4 w-1/2" />
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="space-y-3">
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
          <div className="flex gap-3">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-8 w-full" />
          <div className="flex items-center gap-2 border-t pt-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}
