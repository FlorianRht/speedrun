import { createClient } from "@/lib/supabase/server";
import { formatSeconds } from "@/lib/time";
import { StatsChart } from "@/components/StatsChart";

export default async function GameStatsPage({ params }: { params: Promise<{ game: string }> }) {
  const { game: gameSlug } = await params;
  const supabase = await createClient();

  const { data: game } = await supabase
    .from("games")
    .select("id, name")
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

  const bestOverall = (runs ?? []).reduce<number | null>((min, r) => {
    const t = Number(r.total_time_seconds);
    return min === null || t < min ? t : min;
  }, null);

  const recordsByChapter = (chapters ?? []).map((chapter) => {
    const chapterSplits = (splits ?? []).filter((s) => s.chapter_id === chapter.id && s.time_seconds !== null);
    const best = chapterSplits.reduce<number | null>((min, s) => {
      const t = Number(s.time_seconds);
      return min === null || t < min ? t : min;
    }, null);
    return { name: chapter.name, best };
  });

  const totalRuns = runs?.length ?? 0;
  const totalDeaths = (runs ?? []).reduce((sum, r) => sum + (r.total_deaths ?? 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-display">{game.name} - Statistiques</h1>
        <p className="text-ink/60 text-sm mt-1">Ton évolution au fil de tes runs.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="label">Meilleur temps</p>
          <p className="text-2xl font-bold text-berry">{formatSeconds(bestOverall)}</p>
        </div>
        <div className="card">
          <p className="label">Runs enregistrées</p>
          <p className="text-2xl font-bold">{totalRuns}</p>
        </div>
        <div className="card">
          <p className="label">Morts cumulées</p>
          <p className="text-2xl font-bold">{totalDeaths}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">Évolution du temps final</h2>
        <StatsChart data={chartData} />
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">Records personnels par chapitre</h2>
        <div className="divide-y divide-black/5">
          {recordsByChapter.map((r) => (
            <div key={r.name} className="flex items-center justify-between py-2 text-sm">
              <span className="text-ink/70">{r.name}</span>
              <span className="font-mono font-medium">{formatSeconds(r.best)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
