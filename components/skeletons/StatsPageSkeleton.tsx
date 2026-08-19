import { Skeleton } from "@/components/ui/Skeleton";

function StatCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card card-mobile space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-7 w-24" />
        </div>
      ))}
    </div>
  );
}

export function StatsPageSkeleton() {
  return (
    <div className="space-y-5 md:space-y-8 min-w-0 max-w-full" aria-busy aria-label="Chargement des statistiques">
      <Skeleton className="h-36 sm:h-44 md:h-64 w-full rounded-xl md:rounded-2xl" />

      <StatCards />
      <StatCards />
      <StatCards />

      <div className="card card-mobile space-y-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>

      <div className="card card-mobile space-y-3">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-56 md:h-64 w-full rounded-xl" />
      </div>

      <div className="card card-mobile space-y-3">
        <Skeleton className="h-5 w-36" />
        <div className="lg:hidden space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <div className="hidden lg:block space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
