import { Skeleton } from "@/components/ui/Skeleton";

export function RunsSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6" aria-busy aria-label="Chargement du journal">
      <Skeleton className="h-8 w-56 max-w-full" />

      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card card-mobile space-y-2">
            <div className="flex justify-between gap-3">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}
