import { Skeleton } from "@/components/ui/Skeleton";
import { HomeHeader } from "@/components/HomeHeader";

export function HomeSkeleton() {
  return (
    <>
      <HomeHeader />
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 min-w-0" aria-busy aria-label="Chargement">
        <div className="space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-64 max-w-full" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-56 w-full rounded-2xl" />
          </div>
        </div>
      </main>
    </>
  );
}
