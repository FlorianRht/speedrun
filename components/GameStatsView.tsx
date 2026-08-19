import { StatsChart } from "@/components/StatsChart";
import { ContributionCalendar } from "@/components/ContributionCalendar";
import { formatSeconds, type GameStats } from "@/lib/stats";

type Props = {
  gameName: string;
  headerUrl: string | null;
  stats: GameStats;
  subtitle?: string;
};

export function GameStatsView({ gameName, headerUrl, stats, subtitle }: Props) {
  return (
    <div className="space-y-8">
      <div className="relative rounded-2xl overflow-hidden h-48 md:h-64">
        {headerUrl && (
          <img
            src={headerUrl}
            alt={gameName}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative h-full flex items-end p-8">
          <div>
            {subtitle && <p className="text-sm text-muted mb-1">{subtitle}</p>}
            <h1 className="text-3xl md:text-4xl font-bold font-display">{gameName}</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="PB (Personal Best)" value={formatSeconds(stats.bestOverall)} highlight />
        <StatCard label="Sum of Best" value={formatSeconds(stats.sumOfBest)} />
        <StatCard label="Time Save potentiel" value={formatSeconds(stats.timeSave)} />
        <StatCard label="Runs totales" value={String(stats.totalRuns)} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Moyenne" value={formatSeconds(stats.averageOverall)} />
        <StatCard label="Moyenne (5 dernières)" value={formatSeconds(stats.averageLast5)} />
        <StatCard label="Médiane" value={formatSeconds(stats.medianOverall)} />
        <StatCard label="Pire temps" value={formatSeconds(stats.worstOverall)} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Morts totales" value={String(stats.totalDeaths)} />
        <StatCard
          label="Morts / run (moy.)"
          value={stats.avgDeathsPerRun !== null ? stats.avgDeathsPerRun.toFixed(1) : "-"}
        />
        <StatCard label="Écart-type" value={formatSeconds(stats.stdDev)} />
        <StatCard
          label="Runs depuis dernier PB"
          value={stats.totalRuns > 0 ? String(stats.runsSinceLastPb) : "-"}
        />
      </div>

      <div className="card">
        <h2 className="font-semibold font-display mb-4">Activité</h2>
        <ContributionCalendar data={stats.runsPerDay} />
      </div>

      <div className="card">
        <h2 className="font-semibold font-display mb-4">Évolution du temps final</h2>
        <StatsChart data={stats.chartData} />
      </div>

      <div className="card overflow-x-auto">
        <h2 className="font-semibold font-display mb-4">Détail par chapitre</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted text-left">
              <th className="pb-3 font-medium">Chapitre</th>
              <th className="pb-3 font-medium text-right">Best</th>
              <th className="pb-3 font-medium text-right">Moyenne</th>
              <th className="pb-3 font-medium text-right">Pire</th>
              <th className="pb-3 font-medium text-right">Best morts</th>
              <th className="pb-3 font-medium text-right">Moy. morts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {stats.recordsByChapter.map((r) => (
              <tr key={r.name}>
                <td className="py-3 text-muted">{r.name}</td>
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
                {stats.recordsByChapter.every((r) => r.bestDeaths !== null)
                  ? stats.recordsByChapter.reduce((s, r) => s + r.bestDeaths!, 0)
                  : "-"}
              </td>
              <td className="py-3 text-right font-mono">
                {stats.recordsByChapter.every((r) => r.avgDeaths !== null)
                  ? stats.recordsByChapter.reduce((s, r) => s + r.avgDeaths!, 0).toFixed(1)
                  : "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="card">
      <p className="text-xs text-muted">{label}</p>
      <p className={`text-xl font-bold mt-1 font-mono ${highlight ? "text-berry" : ""}`}>{value}</p>
    </div>
  );
}
