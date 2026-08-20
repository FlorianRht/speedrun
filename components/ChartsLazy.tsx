"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/Skeleton";

export const StatsChartLazy = dynamic(
  () => import("@/components/StatsChart").then((m) => m.StatsChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-xl" />,
  }
);

export const ContributionCalendarLazy = dynamic(
  () => import("@/components/ContributionCalendar").then((m) => m.ContributionCalendar),
  {
    ssr: false,
    loading: () => <Skeleton className="h-28 w-full rounded-xl" />,
  }
);
