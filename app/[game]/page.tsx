import { createClient } from "@/lib/supabase/server";
import { formatSeconds } from "@/lib/time";
import { StatsChart } from "@/components/StatsChart";
import { ContributionCalendar } from "@/components/ContributionCalendar";

export default async function GameStatsPage({ params }: { params: Promise<{ game: string }> }) {
  const { game: gameSlug } = await params;
  const supabase = await createClient();

  const { data: game } = await supabase
    .from("games")
    .select("id, name, steam_app_id")
    .eq("slug", gameSlug)
    .single();
  if (!game) return null;

  const { data: runs } = await supabase
    .from("runs")
    .select("id, run_date, total_time_seconds, total_deaths")
    .eq("game_id", game.id)
    .order("run_date", { ascending: true });

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, name, sort_order")
    .eq("game_id", game.id)
    .order("sort_order");

  const runIds = (runs ?? []).map((r) => r.id);
  const { data: splits } = runIds.length
    ? await supabase
        .from("run_splits")
        .select("run_id, chapter_id, time_seconds, deaths")
        .in("run_id", runIds)
    : { data: [] as any[] };

  const chartData = (runs ?? []).map((r) => ({
    date: new Date(r.run_date).toLocaleDateString("fr-FR"),
    seconds: Number(r.total_time_seconds),
  }));

  // --- Stats calculations ---
  const times = (runs ?? []).map((r) => Number(r.total_time_seconds));
  const bestOverall = times.length ? Math.min(...times) : null;
  const worstOverall = times.length ? Math.max(...times) : null;
  const averageOverall = times.length ? times.reduce((a, b) => a + b, 0) / times.length : null;
  const medianOverall = times.length
    ? [...times].sort((a, b) => a - b)[Math.floor(times.length / 2)]
    : null;

  // Last 5 runs average
  const last5 = times.slice(-5);
  const averageLast5 = last5.length ? last5.reduce((a, b) => a + b, 0) / last5.length : null;

  // Records by chapter + sum of best
  const recordsByChapter = (chapters ?? []).map((chapter) => {
    const chapterSplits = (splits ?? []).filter(
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
  });

  const sumOfBest = recordsByChapter.every((r) => r.best !== null)
    ? recordsByChapter.reduce((sum, r) => sum + r.best!, 0)
    : null;

  // Time save potential (PB - Sum of Best)
  const timeSave = bestOverall !== null && sumOfBest !== null ? bestOverall - sumOfBest : null;

  // Consistency: standard deviation
  const stdDev =
    times.length > 1
      ? Math.sqrt(
          times.reduce((sum, t) => sum + (t - averageOverall!) ** 2, 0) / (times.length - 1)
        )
      : null;

  // Runs since last PB
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

  const totalRuns = runs?.length ?? 0;
  const totalDeaths = (runs ?? []).reduce((sum, r) => sum + (r.total_deaths ?? 0), 0);
  const avgDeathsPerRun = totalRuns ? totalDeaths / totalRuns : null;

  // Runs par jour pour le calendrier de contributions
  const runsPerDay: Record<string, number> = {};
  for (const r of runs ?? []) {
    runsPerDay[r.run_date] = (runsPerDay[r.run_date] ?? 0) + 1;
  }

  const headerUrl = game.steam_app_id
    ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.steam_app_id}/header.jpg`
    : null;

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden h-48 md:h-64">
        {headerUrl && (
          <img
            src={headerUrl}
            alt={game.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative h-full flex items-end p-8">
          <h1 className="text-3xl md:text-4xl font-bold font-display">{game.name}</h1>
        </div>
      </div>

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="PB (Personal Best)" value={formatSeconds(bestOverall)} highlight />
        <StatCard label="Sum of Best" value={formatSeconds(sumOfBest)} />
        <StatCard label="Time Save potentiel" value={formatSeconds(timeSave)} />
        <StatCard label="Runs totales" value={String(totalRuns)} />
      </div>

      {/* KPI Cards - Row 2 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Moyenne" value={formatSeconds(averageOverall)} />
        <StatCard label="Moyenne (5 dernières)" value={formatSeconds(averageLast5)} />
        <StatCard label="Médiane" value={formatSeconds(medianOverall)} />
        <StatCard label="Pire temps" value={formatSeconds(worstOverall)} />
      </div>

      {/* KPI Cards - Row 3 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Morts totales" value={String(totalDeaths)} />
        <StatCard label="Morts / run (moy.)" value={avgDeathsPerRun !== null ? avgDeathsPerRun.toFixed(1) : "-"} />
        <StatCard label="Écart-type" value={formatSeconds(stdDev)} />
        <StatCard label="Runs depuis dernier PB" value={totalRuns > 0 ? String(runsSinceLastPb) : "-"} />
      </div>

      {/* Contribution calendar */}
      <div className="card">
        <h2 className="font-semibold font-display mb-4">Activité</h2>
        <ContributionCalendar data={runsPerDay} />
      </div>

      {/* Chart */}
      <div className="card">
        <h2 className="font-semibold font-display mb-4">Évolution du temps final</h2>
        <StatsChart data={chartData} />
      </div>

      {/* PBs by chapter - detailed table */}
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
            {recordsByChapter.map((r) => (
              <tr key={r.name}>
                <td className="py-3 text-muted">{r.name}</td>
                <td className="py-3 text-right font-mono font-medium text-berry">{formatSeconds(r.best)}</td>
                <td className="py-3 text-right font-mono">{formatSeconds(r.avg)}</td>
                <td className="py-3 text-right font-mono">{formatSeconds(r.worst)}</td>
                <td className="py-3 text-right font-mono">{r.bestDeaths ?? "-"}</td>
                <td className="py-3 text-right font-mono">{r.avgDeaths !== null ? r.avgDeaths.toFixed(1) : "-"}</td>
              </tr>
            ))}
            <tr className="font-medium border-t border-border">
              <td className="py-3">Total (Sum of Best)</td>
              <td className="py-3 text-right font-mono text-berry">{formatSeconds(sumOfBest)}</td>
              <td className="py-3 text-right font-mono">
                {recordsByChapter.every((r) => r.avg !== null)
                  ? formatSeconds(recordsByChapter.reduce((s, r) => s + r.avg!, 0))
                  : "-"}
              </td>
              <td className="py-3 text-right font-mono">
                {recordsByChapter.every((r) => r.worst !== null)
                  ? formatSeconds(recordsByChapter.reduce((s, r) => s + r.worst!, 0))
                  : "-"}
              </td>
              <td className="py-3 text-right font-mono">
                {recordsByChapter.every((r) => r.bestDeaths !== null)
                  ? recordsByChapter.reduce((s, r) => s + r.bestDeaths!, 0)
                  : "-"}
              </td>
              <td className="py-3 text-right font-mono">
                {recordsByChapter.every((r) => r.avgDeaths !== null)
                  ? recordsByChapter.reduce((s, r) => s + r.avgDeaths!, 0).toFixed(1)
                  : "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="card">
      <p className="text-xs text-muted">{label}</p>
      <p className={`text-xl font-bold mt-1 font-mono ${highlight ? "text-berry" : ""}`}>{value}</p>
    </div>
  );
}
