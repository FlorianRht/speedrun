import { formatSeconds } from "@/lib/time";

type Run = {
  id: string;
  run_date: string;
  total_time_seconds: number;
  total_deaths: number | null;
  intro_time_seconds?: number | null;
};

type Chapter = { id: string; name: string; sort_order: number };

type Split = {
  run_id: string;
  chapter_id: string;
  time_seconds: number | null;
  deaths: number | null;
};

export type GameStats = {
  chartData: { date: string; seconds: number }[];
  bestOverall: number | null;
  worstOverall: number | null;
  averageOverall: number | null;
  medianOverall: number | null;
  averageLast5: number | null;
  recordsByChapter: {
    name: string;
    best: number | null;
    worst: number | null;
    avg: number | null;
    bestDeaths: number | null;
    avgDeaths: number | null;
  }[];
  sumOfBest: number | null;
  timeSave: number | null;
  stdDev: number | null;
  runsSinceLastPb: number;
  totalRuns: number;
  totalDeaths: number;
  avgDeathsPerRun: number | null;
  runsPerDay: Record<string, number>;
};

export function computeGameStats(
  runs: Run[],
  chapters: Chapter[],
  splits: Split[]
): GameStats {
  const chartData = runs.map((r) => ({
    date: new Date(r.run_date).toLocaleDateString("fr-FR"),
    seconds: Number(r.total_time_seconds),
  }));

  const times = runs.map((r) => Number(r.total_time_seconds));
  const bestOverall = times.length ? Math.min(...times) : null;
  const worstOverall = times.length ? Math.max(...times) : null;
  const averageOverall = times.length ? times.reduce((a, b) => a + b, 0) / times.length : null;
  const medianOverall = times.length
    ? [...times].sort((a, b) => a - b)[Math.floor(times.length / 2)]
    : null;

  const last5 = times.slice(-5);
  const averageLast5 = last5.length ? last5.reduce((a, b) => a + b, 0) / last5.length : null;

  const introTimes = runs
    .map((run) => {
      const runSplits = splits.filter((s) => s.run_id === run.id);
      const sumSplits = runSplits.reduce((sum, s) => sum + (s.time_seconds ?? 0), 0);

      if (sumSplits > 0) {
        const intro = Number(run.total_time_seconds) - sumSplits;
        return intro > 0 ? intro : null;
      }

      if (run.intro_time_seconds != null && run.intro_time_seconds > 0) {
        return Number(run.intro_time_seconds);
      }

      return null;
    })
    .filter((t): t is number => t !== null);

  const introRecord = {
    name: "Intro",
    best: introTimes.length ? Math.min(...introTimes) : null,
    worst: introTimes.length ? Math.max(...introTimes) : null,
    avg: introTimes.length
      ? introTimes.reduce((a, b) => a + b, 0) / introTimes.length
      : null,
    bestDeaths: null as number | null,
    avgDeaths: null as number | null,
  };

  const recordsByChapter = [
    introRecord,
    ...chapters.map((chapter) => {
    const chapterSplits = splits.filter(
      (s) => s.chapter_id === chapter.id && s.time_seconds !== null
    );
    const chapterTimes = chapterSplits.map((s) => Number(s.time_seconds));
    const best = chapterTimes.length ? Math.min(...chapterTimes) : null;
    const worst = chapterTimes.length ? Math.max(...chapterTimes) : null;
    const avg = chapterTimes.length
      ? chapterTimes.reduce((a, b) => a + b, 0) / chapterTimes.length
      : null;

    const chapterDeaths = chapterSplits.map((s) => s.deaths ?? 0);
    const bestDeaths = chapterDeaths.length ? Math.min(...chapterDeaths) : null;
    const avgDeaths = chapterDeaths.length
      ? chapterDeaths.reduce((a, b) => a + b, 0) / chapterDeaths.length
      : null;

    return { name: chapter.name, best, worst, avg, bestDeaths, avgDeaths };
    }),
  ];

  const sumOfBest = recordsByChapter.every((r) => r.best !== null)
    ? recordsByChapter.reduce((sum, r) => sum + r.best!, 0)
    : null;

  const timeSave = bestOverall !== null && sumOfBest !== null ? bestOverall - sumOfBest : null;

  const stdDev =
    times.length > 1
      ? Math.sqrt(
          times.reduce((sum, t) => sum + (t - averageOverall!) ** 2, 0) / (times.length - 1)
        )
      : null;

  let runsSinceLastPb = 0;
  let pbSoFar = Infinity;
  for (let i = 0; i < times.length; i++) {
    if (times[i] < pbSoFar) {
      pbSoFar = times[i];
      runsSinceLastPb = 0;
    } else {
      runsSinceLastPb++;
    }
  }

  const totalRuns = runs.length;
  const totalDeaths = runs.reduce((sum, r) => sum + (r.total_deaths ?? 0), 0);
  const avgDeathsPerRun = totalRuns ? totalDeaths / totalRuns : null;

  const runsPerDay: Record<string, number> = {};
  for (const r of runs) {
    runsPerDay[r.run_date] = (runsPerDay[r.run_date] ?? 0) + 1;
  }

  return {
    chartData,
    bestOverall,
    worstOverall,
    averageOverall,
    medianOverall,
    averageLast5,
    recordsByChapter,
    sumOfBest,
    timeSave,
    stdDev,
    runsSinceLastPb,
    totalRuns,
    totalDeaths,
    avgDeathsPerRun,
    runsPerDay,
  };
}

export { formatSeconds };
