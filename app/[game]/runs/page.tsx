import { createClient } from "@/lib/supabase/server";
import { formatSeconds } from "@/lib/time";

export default async function RunsPage({ params }: { params: Promise<{ game: string }> }) {
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
    .select("id, run_date, total_time_seconds, total_deaths, comment, categories(name)")
    .eq("game_id", game.id)
    .order("run_date", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold font-display">{game.name} - Journal des runs</h1>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink/50 border-b border-black/5">
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Catégorie</th>
              <th className="py-2 pr-4">Temps</th>
              <th className="py-2 pr-4">Morts</th>
              <th className="py-2 pr-4">Commentaire</th>
            </tr>
          </thead>
          <tbody>
            {(runs ?? []).map((run: any) => (
              <tr key={run.id} className="border-b border-black/5 last:border-0">
                <td className="py-2 pr-4 whitespace-nowrap">
                  {new Date(run.run_date).toLocaleDateString("fr-FR")}
                </td>
                <td className="py-2 pr-4">{run.categories?.name ?? "-"}</td>
                <td className="py-2 pr-4 font-mono">{formatSeconds(run.total_time_seconds)}</td>
                <td className="py-2 pr-4">{run.total_deaths}</td>
                <td className="py-2 pr-4 text-ink/60">{run.comment}</td>
              </tr>
            ))}
            {(!runs || runs.length === 0) && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-ink/40">
                  Aucune run pour l'instant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
