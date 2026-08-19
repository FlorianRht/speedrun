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

function RunSummary({ label, run }: { label: string; run: RunDetail }) {
  return (
    <div
      className="rounded-xl p-4 space-y-1"
      style={{ background: "var(--surface)", border: "1px solid var(--card-border)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="font-mono text-xl font-bold text-berry">{formatSeconds(run.total_time_seconds)}</p>
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
  const isCrossUser = runA.user_id !== runB.user_id;

  const labelA =
    runA.user_id === currentUserId ? `Toi — ${runA.username}` : runA.username;
  const labelB =
    runB.user_id === currentUserId ? `Toi — ${runB.username}` : runB.username;

  return (
    <div className="space-y-5 md:space-y-8 min-w-0">
      <div className="space-y-2">
        <Link
          href={`/${gameSlug}/runs`}
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Retour au journal
        </Link>
        <h1 className="text-xl md:text-2xl font-bold font-display">{gameName} — Comparaison</h1>
        <p className="text-sm text-muted">
          Delta = {labelB} − {labelA}
          {isCrossUser ? " · comparaison inter-joueurs" : ""}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <RunSummary label={labelA} run={runA} />
        <RunSummary label={labelB} run={runB} />
      </div>

      <div className="card card-mobile">
        <h2 className="font-semibold font-display mb-3 text-sm md:text-base">Résumé</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted">Temps total</p>
            <p className={`font-mono font-bold ${deltaClass(comparison.totalTimeDelta)}`}>
              {formatDelta(comparison.totalTimeDelta)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Morts totales</p>
            <p className={`font-mono font-bold ${deltaClass(comparison.totalDeathsDelta)}`}>
              {formatDeathsDelta(comparison.totalDeathsDelta)}
            </p>
          </div>
        </div>
      </div>

      <div className="card card-mobile">
        <h2 className="font-semibold font-display mb-3 md:mb-4 text-sm md:text-base">
          Détail par segment
        </h2>

        <div className="lg:hidden space-y-2">
          {comparison.segments.map((seg) => (
            <div
              key={seg.name}
              className="rounded-xl p-3 space-y-2"
              style={{ background: "var(--surface)", border: "1px solid var(--card-border)" }}
            >
              <p className="font-medium text-sm">{seg.name}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-muted">{labelA}</span>
                  <span className="font-mono">{seg.timeA !== null ? formatSeconds(seg.timeA) : "-"}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted">{labelB}</span>
                  <span className="font-mono">{seg.timeB !== null ? formatSeconds(seg.timeB) : "-"}</span>
                </div>
                <div className="flex justify-between gap-2 col-span-2 pt-1 border-t border-border">
                  <span className="text-muted">Delta temps</span>
                  <span className={`font-mono font-medium ${deltaClass(seg.timeDelta)}`}>
                    {formatDelta(seg.timeDelta)}
                  </span>
                </div>
                {(seg.deathsA !== null || seg.deathsB !== null) && (
                  <>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted">Morts A</span>
                      <span className="font-mono">{seg.deathsA ?? "-"}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted">Morts B</span>
                      <span className="font-mono">{seg.deathsB ?? "-"}</span>
                    </div>
                    <div className="flex justify-between gap-2 col-span-2">
                      <span className="text-muted">Delta morts</span>
                      <span className={`font-mono font-medium ${deltaClass(seg.deathsDelta)}`}>
                        {formatDeathsDelta(seg.deathsDelta)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="hidden lg:block max-w-full overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-muted text-left border-b border-border">
                <th className="pb-3 font-medium">Segment</th>
                <th className="pb-3 font-medium text-right">{labelA}</th>
                <th className="pb-3 font-medium text-right">{labelB}</th>
                <th className="pb-3 font-medium text-right">Delta</th>
                <th className="pb-3 font-medium text-right">Morts A</th>
                <th className="pb-3 font-medium text-right">Morts B</th>
                <th className="pb-3 font-medium text-right">Δ morts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {comparison.segments.map((seg) => (
                <tr key={seg.name}>
                  <td className="py-2.5 text-muted">{seg.name}</td>
                  <td className="py-2.5 text-right font-mono">
                    {seg.timeA !== null ? formatSeconds(seg.timeA) : "-"}
                  </td>
                  <td className="py-2.5 text-right font-mono">
                    {seg.timeB !== null ? formatSeconds(seg.timeB) : "-"}
                  </td>
                  <td className={`py-2.5 text-right font-mono font-medium ${deltaClass(seg.timeDelta)}`}>
                    {formatDelta(seg.timeDelta)}
                  </td>
                  <td className="py-2.5 text-right font-mono">{seg.deathsA ?? "-"}</td>
                  <td className="py-2.5 text-right font-mono">{seg.deathsB ?? "-"}</td>
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
