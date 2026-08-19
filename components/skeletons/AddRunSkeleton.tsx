import { Skeleton } from "@/components/ui/Skeleton";

export function AddRunSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-5 md:space-y-8" aria-busy aria-label="Chargement du formulaire">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      <Skeleton className="h-32 w-full rounded-2xl" />

      <div className="card card-mobile space-y-4">
        <Skeleton className="h-4 w-32" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
        <Skeleton className="h-11 w-full" />
      </div>

      <div className="card card-mobile space-y-3">
        <Skeleton className="h-4 w-36" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>

      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}
