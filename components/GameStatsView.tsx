import type { ReactNode } from "react";
import { StatsChartLazy, ContributionCalendarLazy } from "@/components/ChartsLazy";
import { formatSeconds, type GameStats } from "@/lib/stats";

type Props = {
  gameName: string;
  headerUrl: string | null;
  stats: GameStats;
  subtitle?: string;
};

export function GameStatsView({ gameName, headerUrl, stats, subtitle }: Props) {
  return (
    <div className="space-y-5 md:space-y-8 min-w-0 max-w-full overflow-hidden">
      <div className="relative rounded-xl md:rounded-2xl overflow-hidden h-36 sm:h-44 md:h-64">
        {headerUrl && (
          <img
            src={headerUrl}
            alt={gameName}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative h-full flex items-end p-4 md:p-8">
          <div>
            {subtitle && <p className="text-xs md:text-sm text-muted mb-0.5 md:mb-1">{subtitle}</p>}
            <h1 className="text-2xl md:text-4xl font-bold font-display">{gameName}</h1>
          </div>
        </div>
      </div>

      <div className="card card-mobile space-y-6 md:space-y-7">
        <StatSection title="Records">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3">
            <StatCard label="PB" fullLabel="PB (Personal Best)" value={formatSeconds(stats.bestOverall)} highlight />
            <StatCard label="Sum of Best" value={formatSeconds(stats.sumOfBest)} />
            <StatCard
              label="Gain PB"
              fullLabel="Gain sur l'ancien PB"
              value={stats.pbGain !== null ? formatSeconds(stats.pbGain) : "-"}
            />
            <StatCard label="Runs" fullLabel="Runs totales" value={String(stats.totalRuns)} />
          </div>
        </StatSection>

        <StatSection title="Temps globaux" bordered>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3">
            <StatCard label="Moyenne" value={formatSeconds(stats.averageOverall)} />
            <StatCard label="Médiane" value={formatSeconds(stats.medianOverall)} />
            <StatCard label="Pire" fullLabel="Pire temps" value={formatSeconds(stats.worstOverall)} />
            <StatCard label="Écart-type" value={formatSeconds(stats.stdDev)} />
          </div>
        </StatSection>

        <StatSection title="Forme récente" bordered>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3">
            <StatCard label="5 dernières" fullLabel="Moyenne (5 dernières)" value={formatSeconds(stats.averageLast5)} />
            <StatCard label="10 dernières" fullLabel="Moyenne (10 dernières)" value={formatSeconds(stats.averageLast10)} />
            <StatCard label="25 dernières" fullLabel="Moyenne (25 dernières)" value={formatSeconds(stats.averageLast25)} />
            <StatCard
              label="Depuis PB"
              fullLabel="Runs depuis dernier PB"
              value={stats.totalRuns > 0 ? String(stats.runsSinceLastPb) : "-"}
            />
          </div>
        </StatSection>

        <StatSection title="Morts" bordered>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3">
            <StatCard label="Morts totales" value={String(stats.totalDeaths)} />
            <StatCard
              label="Morts/run"
              fullLabel="Morts / run (moy.)"
              value={stats.avgDeathsPerRun !== null ? stats.avgDeathsPerRun.toFixed(1) : "-"}
            />
          </div>
        </StatSection>
      </div>

      <div className="card card-mobile">
        <h2 className="font-semibold font-display mb-3 md:mb-4 text-sm md:text-base">Activité</h2>
        <ContributionCalendarLazy data={stats.runsPerDay} />
      </div>

      <div className="card card-mobile">
        <h2 className="font-semibold font-display mb-3 md:mb-4 text-sm md:text-base">Évolution du temps final</h2>
        <StatsChartLazy data={stats.chartData} />
      </div>

      <div className="card card-mobile">
        <h2 className="font-semibold font-display mb-3 md:mb-4 text-sm md:text-base">Détail par chapitre</h2>

        {/* Mobile / tablet: cards */}
        <div className="lg:hidden space-y-2">
          {stats.recordsByChapter.map((r) => (
            <div
              key={r.name}
              className="rounded-xl p-3 space-y-2"
              style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}
            >
              <p className="font-medium text-sm">{r.name}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <ChapterStat label="Best" value={formatSeconds(r.best)} highlight />
                <ChapterStat label="Moyenne" value={formatSeconds(r.avg)} />
                <ChapterStat label="Pire" value={formatSeconds(r.worst)} />
                <ChapterStat label="Best morts" value={r.bestDeaths !== null ? String(r.bestDeaths) : "-"} />
                <ChapterStat label="Moy. morts" value={r.avgDeaths !== null ? r.avgDeaths.toFixed(1) : "-"} />
              </div>
            </div>
          ))}
          <div
            className="rounded-xl p-3 font-medium text-sm"
            style={{ background: "color-mix(in srgb, var(--berry) 8%, var(--card))", border: "1px solid var(--card-border)" }}
          >
            <p className="mb-1.5">Total (Sum of Best)</p>
            <p className="font-mono text-berry">{formatSeconds(stats.sumOfBest)}</p>
          </div>
        </div>

        {/* Desktop: table */}
        <div className="hidden lg:block max-w-full overflow-hidden">
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="text-muted text-left">
                <th className="pb-3 font-medium w-[28%]">Chapitre</th>
                <th className="pb-3 font-medium text-right w-[14%]">Best</th>
                <th className="pb-3 font-medium text-right w-[14%]">Moyenne</th>
                <th className="pb-3 font-medium text-right w-[14%]">Pire</th>
                <th className="pb-3 font-medium text-right w-[15%]">Best morts</th>
                <th className="pb-3 font-medium text-right w-[15%]">Moy. morts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.recordsByChapter.map((r) => (
                <tr key={r.name}>
                  <td className="py-3 text-muted truncate pr-2">{r.name}</td>
                  <td className="py-3 text-right font-mono font-medium text-berry">
                    {formatSeconds(r.best)}
                  </td>
                  <td className="py-3 text-right font-mono">{formatSeconds(r.avg)}</td>
                  <td className="py-3 text-right font-mono">{formatSeconds(r.worst)}</td>
                  <td className="py-3 text-right font-mono">{r.bestDeaths ?? "-"}</td>
                  <td className="py-3 text-right font-mono">
                    {r.avgDeaths !== null ? r.avgDeaths.toFixed(1) : "-"}
                  </td>
                </tr>
              ))}
              <tr className="font-medium border-t border-border">
                <td className="py-3">Total (Sum of Best)</td>
                <td className="py-3 text-right font-mono text-berry">
                  {formatSeconds(stats.sumOfBest)}
                </td>
                <td className="py-3 text-right font-mono">
                  {stats.recordsByChapter.every((r) => r.avg !== null)
                    ? formatSeconds(stats.recordsByChapter.reduce((s, r) => s + r.avg!, 0))
                    : "-"}
                </td>
                <td className="py-3 text-right font-mono">
                  {stats.recordsByChapter.every((r) => r.worst !== null)
                    ? formatSeconds(stats.recordsByChapter.reduce((s, r) => s + r.worst!, 0))
                    : "-"}
                </td>
                <td className="py-3 text-right font-mono">
                  {(() => {
                    const withDeaths = stats.recordsByChapter.filter((r) => r.bestDeaths !== null);
                    return withDeaths.length
                      ? withDeaths.reduce((s, r) => s + r.bestDeaths!, 0)
                      : "-";
                  })()}
                </td>
                <td className="py-3 text-right font-mono">
                  {(() => {
                    const withDeaths = stats.recordsByChapter.filter((r) => r.avgDeaths !== null);
                    return withDeaths.length
                      ? withDeaths.reduce((s, r) => s + r.avgDeaths!, 0).toFixed(1)
                      : "-";
                  })()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatSection({
  title,
  bordered,
  children,
}: {
  title: string;
  bordered?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={bordered ? "pt-6 md:pt-7 border-t border-border" : undefined}>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2.5 md:mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

function StatCard({
  label,
  fullLabel,
  value,
  highlight,
}: {
  label: string;
  fullLabel?: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-3 md:p-4"
      style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}
    >
      <p className="text-[11px] md:text-xs text-muted leading-tight">
        <span className="lg:hidden">{label}</span>
        <span className="hidden lg:inline">{fullLabel ?? label}</span>
      </p>
      <p className={`text-lg md:text-xl font-bold mt-0.5 md:mt-1 font-mono ${highlight ? "text-berry" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function ChapterStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted">{label}</span>
      <span className={`font-mono ${highlight ? "text-berry font-medium" : ""}`}>{value}</span>
    </div>
  );
}
