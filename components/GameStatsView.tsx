import type { CSSProperties, ReactNode } from "react";
import { StatsChartLazy, ContributionCalendarLazy } from "@/components/ChartsLazy";
import { AnimatedValue } from "@/components/ui/AnimatedValue";
import { formatSeconds, type GameStats } from "@/lib/stats";

const STATS_BASE = 80;
const STATS_STEP = 42;
const BLOCK_ACTIVITY = 520;
const BLOCK_CHART = 580;
const BLOCK_CHAPTERS = 640;
const CHAPTER_STEP = 35;

function animDelay(ms: number): CSSProperties {
  return { animationDelay: `${ms}ms` };
}

type Props = {
  gameName: string;
  headerUrl: string | null;
  stats: GameStats;
  subtitle?: string;
};

export function GameStatsView({ gameName, headerUrl, stats, subtitle }: Props) {
  return (
    <div className="space-y-5 md:space-y-8 min-w-0 max-w-full overflow-hidden">
      <div
        className="animate-enter animate-fade-in-up relative rounded-xl md:rounded-2xl overflow-hidden h-36 sm:h-44 md:h-64"
        style={animDelay(0)}
      >
        {headerUrl && (
          <img
            src={headerUrl}
            alt={gameName}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div
          className="absolute inset-x-0 bottom-0 h-2/5 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, var(--background) 0%, color-mix(in srgb, var(--background) 55%, transparent) 55%, transparent 100%)",
          }}
          aria-hidden
        />
        <div className="relative h-full flex items-end p-4 md:p-8">
          <div>
            {subtitle && <p className="text-xs md:text-sm text-muted mb-0.5 md:mb-1">{subtitle}</p>}
            <h1 className="text-2xl md:text-4xl font-bold font-display drop-shadow-sm">{gameName}</h1>
          </div>
        </div>
      </div>

      <div className="card card-mobile space-y-6 md:space-y-7">
        <StatSection title="Records" titleDelay={STATS_BASE}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3">
            <StatCard delay={0} label="PB" fullLabel="PB (Personal Best)" amount={stats.bestOverall} amountType="time" highlight />
            <StatCard delay={1} label="Sum of Best" amount={stats.sumOfBest} amountType="time" />
            <StatCard delay={2} label="Gain PB" fullLabel="Gain sur l'ancien PB" amount={stats.pbGain} amountType="time" />
            <StatCard delay={3} label="Runs" fullLabel="Runs totales" amount={stats.totalRuns} amountType="integer" />
          </div>
        </StatSection>

        <StatSection title="Temps globaux" bordered titleDelay={STATS_BASE + STATS_STEP * 4}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3">
            <StatCard delay={4} label="Moyenne" amount={stats.averageOverall} amountType="time" />
            <StatCard delay={5} label="Médiane" amount={stats.medianOverall} amountType="time" />
            <StatCard delay={6} label="Pire" fullLabel="Pire temps" amount={stats.worstOverall} amountType="time" />
            <StatCard delay={7} label="Écart-type" amount={stats.stdDev} amountType="time" />
          </div>
        </StatSection>

        <StatSection title="Forme récente" bordered titleDelay={STATS_BASE + STATS_STEP * 8}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3">
            <StatCard delay={8} label="5 dernières" fullLabel="Moyenne (5 dernières)" amount={stats.averageLast5} amountType="time" />
            <StatCard delay={9} label="10 dernières" fullLabel="Moyenne (10 dernières)" amount={stats.averageLast10} amountType="time" />
            <StatCard delay={10} label="25 dernières" fullLabel="Moyenne (25 dernières)" amount={stats.averageLast25} amountType="time" />
            <StatCard
              delay={11}
              label="Depuis PB"
              fullLabel="Runs depuis dernier PB"
              amount={stats.totalRuns > 0 ? stats.runsSinceLastPb : null}
              amountType="integer"
            />
          </div>
        </StatSection>

        <StatSection title="Morts" bordered titleDelay={STATS_BASE + STATS_STEP * 12}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3">
            <StatCard delay={12} label="Morts totales" amount={stats.totalDeaths} amountType="integer" />
            <StatCard
              delay={13}
              label="Morts/run"
              fullLabel="Morts / run (moy.)"
              amount={stats.avgDeathsPerRun}
              amountType="decimal"
              decimals={1}
            />
          </div>
        </StatSection>
      </div>

      <div className="animate-enter animate-fade-in-up card card-mobile" style={animDelay(BLOCK_ACTIVITY)}>
        <h2 className="font-semibold font-display mb-3 md:mb-4 text-sm md:text-base">Activité</h2>
        <ContributionCalendarLazy data={stats.runsPerDay} />
      </div>

      <div className="animate-enter animate-fade-in-up card card-mobile" style={animDelay(BLOCK_CHART)}>
        <h2 className="font-semibold font-display mb-3 md:mb-4 text-sm md:text-base">Évolution du temps final</h2>
        <StatsChartLazy data={stats.chartData} />
      </div>

      <div className="animate-enter animate-fade-in-up card card-mobile" style={animDelay(BLOCK_CHAPTERS)}>
        <h2 className="font-semibold font-display mb-3 md:mb-4 text-sm md:text-base">Détail par chapitre</h2>

        <div className="lg:hidden space-y-2">
          {stats.recordsByChapter.map((r, i) => (
            <div
              key={r.name}
              className="animate-enter animate-fade-in-up rounded-xl p-3 space-y-2"
              style={{
                ...animDelay(BLOCK_CHAPTERS + 60 + i * CHAPTER_STEP),
                background: "var(--surface)",
                border: "1px solid var(--card-border)",
              }}
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
            className="animate-enter animate-fade-in-up rounded-xl p-3 font-medium text-sm"
            style={{
              ...animDelay(BLOCK_CHAPTERS + 60 + stats.recordsByChapter.length * CHAPTER_STEP),
              background: "color-mix(in srgb, var(--berry) 8%, var(--card))",
              border: "1px solid var(--card-border)",
            }}
          >
            <p className="mb-1.5">Total (Sum of Best)</p>
            <p className="font-mono text-berry">{formatSeconds(stats.sumOfBest)}</p>
          </div>
        </div>

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
              {stats.recordsByChapter.map((r, i) => (
                <tr
                  key={r.name}
                  className="animate-enter animate-fade-in"
                  style={animDelay(BLOCK_CHAPTERS + 60 + i * CHAPTER_STEP)}
                >
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
              <tr
                className="animate-enter animate-fade-in font-medium border-t border-border"
                style={animDelay(BLOCK_CHAPTERS + 60 + stats.recordsByChapter.length * CHAPTER_STEP)}
              >
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
  titleDelay,
  children,
}: {
  title: string;
  bordered?: boolean;
  titleDelay?: number;
  children: ReactNode;
}) {
  return (
    <section className={bordered ? "pt-6 md:pt-7 border-t border-border" : undefined}>
      <h2
        className={
          titleDelay !== undefined
            ? "animate-enter animate-fade-in-up text-xs font-semibold uppercase tracking-wide text-muted mb-2.5 md:mb-3"
            : "text-xs font-semibold uppercase tracking-wide text-muted mb-2.5 md:mb-3"
        }
        style={titleDelay !== undefined ? animDelay(titleDelay) : undefined}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function StatCard({
  label,
  fullLabel,
  amount,
  amountType,
  decimals,
  highlight,
  delay = 0,
}: {
  label: string;
  fullLabel?: string;
  amount: number | null;
  amountType: "time" | "integer" | "decimal";
  decimals?: number;
  highlight?: boolean;
  delay?: number;
}) {
  const cardDelay = STATS_BASE + delay * STATS_STEP;

  return (
    <div
      className="animate-enter animate-fade-in-up rounded-xl p-3 md:p-4"
      style={{
        ...animDelay(cardDelay),
        background: "var(--surface)",
        border: "1px solid var(--card-border)",
      }}
    >
      <p className="text-[11px] md:text-xs text-muted leading-tight">
        <span className="lg:hidden">{label}</span>
        <span className="hidden lg:inline">{fullLabel ?? label}</span>
      </p>
      <AnimatedValue
        value={amount}
        type={amountType}
        decimals={decimals}
        delay={cardDelay + 280}
        highlight={highlight}
        className={`text-lg md:text-xl font-bold mt-0.5 md:mt-1 font-mono ${highlight ? "text-berry" : ""}`}
      />
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
