import { Skeleton } from "@/components/ui/Skeleton";

export function HomeSkeleton() {
  return (
    <main className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-16 min-w-0" aria-busy aria-label="Chargement des jeux">
      <div className="flex items-center justify-between mb-8 md:mb-10">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="grid gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-28 md:h-32 w-full rounded-xl md:rounded-2xl" />
        ))}
      </div>
    </main>
  );
}
