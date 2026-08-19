import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { formatSeconds } from "@/lib/time";
import { fetchGameBySlug } from "@/lib/game-data";
import { getProfile } from "@/lib/profiles";

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ game: string }>;
}) {
  const { game: gameSlug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const game = await fetchGameBySlug(supabase, gameSlug);
  if (!game) notFound();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("game_id", game.id)
    .order("name");

  const { data: runs } = await supabase
    .from("runs")
    .select("user_id, total_time_seconds, total_deaths, run_date, category_id, categories(name)")
    .eq("game_id", game.id);

  // Best run per user (global PB)
  const bestByUser = new Map<
    string,
    {
      time: number;
      deaths: number;
      date: string;
      category: string;
    }
  >();

  for (const run of runs ?? []) {
    const time = Number(run.total_time_seconds);
    const existing = bestByUser.get(run.user_id);
    if (!existing || time < existing.time) {
      bestByUser.set(run.user_id, {
        time,
        deaths: run.total_deaths ?? 0,
        date: run.run_date,
        category: (run as any).categories?.name ?? "-",
      });
    }
  }

  const userIds = [...bestByUser.keys()];
  const profiles = await Promise.all(userIds.map((id) => getProfile(supabase, id)));
  const profileMap = new Map(
    profiles.filter(Boolean).map((p) => [p!.id, p!.username])
  );

  const leaderboard = userIds
    .map((userId) => ({
      userId,
      username: profileMap.get(userId) ?? "Joueur",
      isMe: userId === user.id,
      ...bestByUser.get(userId)!,
    }))
    .sort((a, b) => a.time - b.time);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">{game.name} — Leaderboard</h1>
        <p className="text-sm text-muted mt-1">Meilleur temps par joueur</p>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-border">
              <th className="py-2 pr-4 font-medium w-12">#</th>
              <th className="py-2 pr-4 font-medium">Joueur</th>
              <th className="py-2 pr-4 font-medium">Temps</th>
              <th className="py-2 pr-4 font-medium">Morts</th>
              <th className="py-2 pr-4 font-medium">Catégorie</th>
              <th className="py-2 pr-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, i) => (
              <tr
                key={entry.userId}
                className={`border-b border-border last:border-0 ${entry.isMe ? "bg-berry/5" : ""}`}
              >
                <td className="py-3 pr-4 text-muted font-medium">{i + 1}</td>
                <td className="py-3 pr-4">
                  <Link
                    href={`/${gameSlug}/player/${entry.userId}`}
                    className="font-medium hover:text-berry transition"
                  >
                    {entry.username}
                    {entry.isMe && (
                      <span className="ml-2 text-xs text-berry">(toi)</span>
                    )}
                  </Link>
                </td>
                <td className="py-3 pr-4 font-mono font-medium text-berry">
                  {formatSeconds(entry.time)}
                </td>
                <td className="py-3 pr-4">{entry.deaths}</td>
                <td className="py-3 pr-4 text-muted">{entry.category}</td>
                <td className="py-3 pr-4 text-muted whitespace-nowrap">
                  {new Date(entry.date).toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
            {leaderboard.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted">
                  Aucune run enregistrée pour l'instant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {categories && categories.length > 0 && (
        <p className="text-xs text-muted">
          Catégories disponibles : {categories.map((c) => c.name).join(", ")}. Le leaderboard
          affiche le PB global de chaque joueur.
        </p>
      )}
    </div>
  );
}
