import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatSeconds } from "@/lib/time";
import { DeleteRunButton } from "@/components/DeleteRunButton";

export default async function RunsPage({ params }: { params: Promise<{ game: string }> }) {
  const { game: gameSlug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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
    .eq("user_id", user.id)
    .order("run_date", { ascending: false });

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold font-display">{game.name} — Journal des runs</h1>

      {/* Mobile / tablet: cards */}
      <div className="lg:hidden space-y-2">
        {(runs ?? []).map((run: any) => (
          <div key={run.id} className="card card-mobile">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-mono text-lg font-bold text-berry">
                    {formatSeconds(run.total_time_seconds)}
                  </p>
                  <span className="text-xs text-muted shrink-0">
                    {new Date(run.run_date).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-muted mt-1">
                  <span>{run.categories?.name ?? "-"}</span>
                  <span>{run.total_deaths} morts</span>
                </div>
                {run.comment && (
                  <p className="text-sm text-muted mt-2 line-clamp-2">{run.comment}</p>
                )}
              </div>
              <DeleteRunButton runId={run.id} gameSlug={gameSlug} />
            </div>
          </div>
        ))}
        {(!runs || runs.length === 0) && (
          <div className="card card-mobile text-center text-muted py-8">
            Aucune run pour l'instant.
          </div>
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden lg:block card max-w-full overflow-hidden">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-border">
              <th className="py-2 pr-2 font-medium w-[14%]">Date</th>
              <th className="py-2 pr-2 font-medium w-[16%]">Catégorie</th>
              <th className="py-2 pr-2 font-medium w-[16%]">Temps</th>
              <th className="py-2 pr-2 font-medium w-[10%]">Morts</th>
              <th className="py-2 pr-2 font-medium">Commentaire</th>
              <th className="py-2 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {(runs ?? []).map((run: any) => (
              <tr key={run.id} className="border-b border-border last:border-0 group">
                <td className="py-2 pr-2 truncate">
                  {new Date(run.run_date).toLocaleDateString("fr-FR")}
                </td>
                <td className="py-2 pr-2 truncate">{run.categories?.name ?? "-"}</td>
                <td className="py-2 pr-2 font-mono truncate">{formatSeconds(run.total_time_seconds)}</td>
                <td className="py-2 pr-2">{run.total_deaths}</td>
                <td className="py-2 pr-2 text-muted truncate">{run.comment}</td>
                <td className="py-2">
                  <DeleteRunButton runId={run.id} gameSlug={gameSlug} />
                </td>
              </tr>
            ))}
            {(!runs || runs.length === 0) && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-muted">
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
