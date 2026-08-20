import Link from "next/link";
import {
  compareRuns,
  formatDeathsDelta,
  formatDelta,
  type RunDetail,
} from "@/lib/compare-runs";
import { formatSeconds } from "@/lib/time";

type Props = {
  gameSlug: string;
  gameName: string;
  runA: RunDetail;
  runB: RunDetail;
  currentUserId: string;
};

function deltaClass(value: number | null): string {
  if (value === null || value === 0) return "text-muted";
  return value < 0 ? "text-emerald-500" : "text-red-400";
}

function sideTone(side: "a" | "b") {
  return side === "a"
    ? { accent: "var(--berry, #b044e0)", badge: "bg-berry/15 text-berry", text: "text-berry" }
    : { accent: "var(--sky, #4AB3C8)", badge: "bg-sky/15 text-sky", text: "text-sky" };
}

function RunSummary({
  badge,
  label,
  side,
  run,
}: {
  badge: string;
  label: string;
  side: "a" | "b";
  run: RunDetail;
}) {
  const tone = sideTone(side);

  return (
    <div
      className="rounded-xl p-4 space-y-2"
      style={{
        background: "var(--surface)",
        border: `1px solid ${tone.accent}`,
        boxShadow: `inset 3px 0 0 ${tone.accent}`,
      }}
    >
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 ${tone.badge}`}>
          {badge}
        </span>
        <p className={`text-sm font-semibold ${tone.text}`}>{label}</p>
      </div>
      <p className={`font-mono text-xl font-bold ${tone.text}`}>
        {formatSeconds(run.total_time_seconds)}
      </p>
      <p className="text-sm text-muted">
        {new Date(run.run_date).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
      <div className="flex flex-wrap gap-x-3 text-xs text-muted">
        {run.category_name && <span>{run.category_name}</span>}
        {run.total_deaths !== null && <span>{run.total_deaths} morts</span>}
      </div>
      {run.comment && <p className="text-xs text-muted line-clamp-2 pt-1">{run.comment}</p>}
    </div>
  );
}

export function RunCompareView({ gameSlug, gameName, runA, runB, currentUserId }: Props) {
  const comparison = compareRuns(runA, runB);
  const sameUser = runA.user_id === runB.user_id;
  const aIsYou = runA.user_id === currentUserId;
  const bIsYou = runB.user_id === currentUserId;
  const toneA = sideTone("a");
  const toneB = sideTone("b");

  const nameA = sameUser ? "Run A" : aIsYou ? "Toi" : runA.username;
  const nameB = sameUser ? "Run B" : bIsYou ? "Toi" : runB.username;
  const badgeA = sameUser ? "Run A" : aIsYou ? "Toi" : "Adversaire";
  const badgeB = sameUser ? "Run B" : bIsYou ? "Toi" : "Adversaire";
  const labelA = sameUser
    ? new Date(runA.run_date).toLocaleDateString("fr-FR")
    : runA.username;
  const labelB = sameUser
    ? new Date(runB.run_date).toLocaleDateString("fr-FR")
    : runB.username;

  return (
    <div className="space-y-5 md:space-y-8 min-w-0">
      <div className="space-y-2">
        <Link
          href={`/${gameSlug}/runs/compare`}
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Changer les runs
        </Link>
        <h1 className="text-xl md:text-2xl font-bold font-display">
          {gameName} — {nameA} vs {nameB}
        </h1>
        <p className="text-sm text-muted">
          Écart = {nameA} − {nameB}.{" "}
          <span className="text-emerald-500">Vert</span> = {nameA} meilleur{sameUser ? "e" : ""} ·{" "}
          <span className="text-red-400">Rouge</span> = {nameB} meilleur{sameUser ? "e" : ""}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <RunSummary badge={badgeA} label={labelA} side="a" run={runA} />
        <RunSummary badge={badgeB} label={labelB} side="b" run={runB} />
      </div>

      <div className="card card-mobile">
        <h2 className="font-semibold font-display mb-3 text-sm md:text-base">Écart global</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted">Temps ({nameA} vs {nameB})</p>
            <p className={`font-mono font-bold text-lg ${deltaClass(comparison.totalTimeDelta)}`}>
              {formatDelta(comparison.totalTimeDelta)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Morts ({nameA} vs {nameB})</p>
            <p className={`font-mono font-bold text-lg ${deltaClass(comparison.totalDeathsDelta)}`}>
              {formatDeathsDelta(comparison.totalDeathsDelta)}
            </p>
          </div>
        </div>
      </div>

      <div className="card card-mobile">
        <h2 className="font-semibold font-display mb-3 md:mb-4 text-sm md:text-base">
          Détail par segment
        </h2>

        {/* Mobile */}
        <div className="lg:hidden space-y-2">
          {comparison.segments.map((seg) => (
            <div
              key={seg.name}
              className="rounded-xl p-3 space-y-2.5"
              style={{ background: "var(--surface)", border: "1px solid var(--card-border)" }}
            >
              <p className="font-medium text-sm">{seg.name}</p>

              <div className="grid grid-cols-2 gap-2">
                <div
                  className="rounded-lg p-2 space-y-0.5"
                  style={{ borderLeft: `3px solid ${toneA.accent}` }}
                >
                  <p className={`text-[10px] font-semibold uppercase ${toneA.text}`}>{nameA}</p>
                  <p className="font-mono text-sm font-medium">
                    {seg.timeA !== null ? formatSeconds(seg.timeA) : "-"}
                  </p>
                  {(seg.deathsA !== null || seg.deathsB !== null) && (
                    <p className="text-xs text-muted">{seg.deathsA ?? "-"} morts</p>
                  )}
                </div>
                <div
                  className="rounded-lg p-2 space-y-0.5"
                  style={{ borderLeft: `3px solid ${toneB.accent}` }}
                >
                  <p className={`text-[10px] font-semibold uppercase ${toneB.text}`}>{nameB}</p>
                  <p className="font-mono text-sm font-medium">
                    {seg.timeB !== null ? formatSeconds(seg.timeB) : "-"}
                  </p>
                  {(seg.deathsA !== null || seg.deathsB !== null) && (
                    <p className="text-xs text-muted">{seg.deathsB ?? "-"} morts</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between gap-3 text-xs pt-1 border-t border-border">
                <span className="text-muted">Écart temps</span>
                <span className={`font-mono font-medium ${deltaClass(seg.timeDelta)}`}>
                  {formatDelta(seg.timeDelta)}
                </span>
              </div>
              {(seg.deathsA !== null || seg.deathsB !== null) && (
                <div className="flex justify-between gap-3 text-xs">
                  <span className="text-muted">Écart morts</span>
                  <span className={`font-mono font-medium ${deltaClass(seg.deathsDelta)}`}>
                    {formatDeathsDelta(seg.deathsDelta)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden lg:block max-w-full overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-muted text-left border-b border-border">
                <th className="pb-2 font-medium align-bottom" rowSpan={2}>
                  Segment
                </th>
                <th
                  className={`pb-1 pt-0 font-semibold text-center border-b border-border ${toneA.text}`}
                  colSpan={2}
                >
                  {nameA}
                </th>
                <th
                  className={`pb-1 pt-0 font-semibold text-center border-b border-border ${toneB.text}`}
                  colSpan={2}
                >
                  {nameB}
                </th>
                <th className="pb-2 font-medium text-right align-bottom" rowSpan={2}>
                  Écart temps
                </th>
                <th className="pb-2 font-medium text-right align-bottom" rowSpan={2}>
                  Écart morts
                </th>
              </tr>
              <tr className="text-muted text-left border-b border-border">
                <th className="pb-2 pt-1 font-medium text-right">Temps</th>
                <th className="pb-2 pt-1 font-medium text-right">Morts</th>
                <th className="pb-2 pt-1 font-medium text-right">Temps</th>
                <th className="pb-2 pt-1 font-medium text-right">Morts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {comparison.segments.map((seg) => (
                <tr key={seg.name}>
                  <td className="py-2.5 text-muted">{seg.name}</td>
                  <td className={`py-2.5 text-right font-mono ${toneA.text}`}>
                    {seg.timeA !== null ? formatSeconds(seg.timeA) : "-"}
                  </td>
                  <td className="py-2.5 text-right font-mono text-muted">{seg.deathsA ?? "-"}</td>
                  <td className={`py-2.5 text-right font-mono ${toneB.text}`}>
                    {seg.timeB !== null ? formatSeconds(seg.timeB) : "-"}
                  </td>
                  <td className="py-2.5 text-right font-mono text-muted">{seg.deathsB ?? "-"}</td>
                  <td className={`py-2.5 text-right font-mono font-medium ${deltaClass(seg.timeDelta)}`}>
                    {formatDelta(seg.timeDelta)}
                  </td>
                  <td className={`py-2.5 text-right font-mono font-medium ${deltaClass(seg.deathsDelta)}`}>
                    {formatDeathsDelta(seg.deathsDelta)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
