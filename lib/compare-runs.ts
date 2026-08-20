import { formatSeconds } from "@/lib/time";

export type RunSegment = {
  name: string;
  time_seconds: number | null;
  deaths: number | null;
};

export type RunDetail = {
  id: string;
  user_id: string;
  username: string;
  run_date: string;
  total_time_seconds: number;
  total_deaths: number | null;
  comment: string | null;
  segments: RunSegment[];
};

export type CompareRunOption = {
  id: string;
  run_date: string;
  total_time_seconds: number;
  total_deaths: number | null;
};

export type ComparePlayerOption = {
  userId: string;
  username: string;
  runs: CompareRunOption[];
};

type Chapter = { id: string; name: string; sort_order: number };
type Split = { chapter_id: string; time_seconds: number | null; deaths: number | null };
type RunRow = {
  id: string;
  user_id: string;
  run_date: string;
  total_time_seconds: number;
  total_deaths: number | null;
  intro_time_seconds?: number | null;
  comment: string | null;
};

export function buildRunDetail(
  run: RunRow,
  chapters: Chapter[],
  splits: Split[],
  username: string
): RunDetail {
  const splitSum = splits.reduce((sum, s) => sum + (s.time_seconds ?? 0), 0);
  let introTime: number | null = null;

  if (splitSum > 0) {
    const intro = Number(run.total_time_seconds) - splitSum;
    introTime = intro > 0 ? intro : null;
  } else if (run.intro_time_seconds != null && run.intro_time_seconds > 0) {
    introTime = Number(run.intro_time_seconds);
  }

  const segments: RunSegment[] = [];

  if (introTime !== null || splits.length > 0) {
    segments.push({ name: "Intro", time_seconds: introTime, deaths: null });
  }

  for (const chapter of chapters) {
    const split = splits.find((s) => s.chapter_id === chapter.id);
    segments.push({
      name: chapter.name,
      time_seconds: split?.time_seconds != null ? Number(split.time_seconds) : null,
      deaths: split?.deaths ?? null,
    });
  }

  return {
    id: run.id,
    user_id: run.user_id,
    username,
    run_date: run.run_date,
    total_time_seconds: Number(run.total_time_seconds),
    total_deaths: run.total_deaths,
    comment: run.comment,
    segments,
  };
}

export type SegmentComparison = {
  name: string;
  timeA: number | null;
  timeB: number | null;
  deathsA: number | null;
  deathsB: number | null;
  timeDelta: number | null;
  deathsDelta: number | null;
};

export type RunComparison = {
  runA: RunDetail;
  runB: RunDetail;
  totalTimeDelta: number;
  totalDeathsDelta: number | null;
  segments: SegmentComparison[];
};

export function compareRuns(runA: RunDetail, runB: RunDetail): RunComparison {
  const segmentNames = [...new Set([...runA.segments, ...runB.segments].map((s) => s.name))];

  const segments: SegmentComparison[] = segmentNames.map((name) => {
    const segA = runA.segments.find((s) => s.name === name);
    const segB = runB.segments.find((s) => s.name === name);
    const timeA = segA?.time_seconds ?? null;
    const timeB = segB?.time_seconds ?? null;
    const deathsA = segA?.deaths ?? null;
    const deathsB = segB?.deaths ?? null;

    return {
      name,
      timeA,
      timeB,
      deathsA,
      deathsB,
      // Delta = A − B : négatif = A meilleur (plus rapide / moins de morts)
      timeDelta: timeA !== null && timeB !== null ? timeA - timeB : null,
      deathsDelta: deathsA !== null && deathsB !== null ? deathsA - deathsB : null,
    };
  });

  return {
    runA,
    runB,
    totalTimeDelta: runA.total_time_seconds - runB.total_time_seconds,
    totalDeathsDelta:
      runA.total_deaths !== null && runB.total_deaths !== null
        ? runA.total_deaths - runB.total_deaths
        : null,
    segments,
  };
}

export function formatDelta(seconds: number | null): string {
  if (seconds === null) return "-";
  if (seconds === 0) return "±0";
  const sign = seconds > 0 ? "+" : "−";
  return `${sign}${formatSeconds(Math.abs(seconds))}`;
}

export function formatDeathsDelta(delta: number | null): string {
  if (delta === null) return "-";
  if (delta === 0) return "±0";
  return delta > 0 ? `+${delta}` : String(delta);
}
