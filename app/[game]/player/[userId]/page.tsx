import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { GameStatsView } from "@/components/GameStatsView";
import { fetchGameBySlug, fetchUserGameStats, getSteamHeaderUrl } from "@/lib/game-data";
import { getProfile } from "@/lib/profiles";

export default async function PlayerStatsPage({
  params,
}: {
  params: Promise<{ game: string; userId: string }>;
}) {
  const { game: gameSlug, userId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const game = await fetchGameBySlug(supabase, gameSlug);
  if (!game) notFound();

  const profile = await getProfile(supabase, userId);
  if (!profile) notFound();

  const stats = await fetchUserGameStats(supabase, game.id, userId);
  const isMe = user.id === userId;

  return (
    <div className="space-y-4">
      {!isMe && (
        <Link
          href={`/${gameSlug}/leaderboard`}
          className="text-sm text-muted hover:text-foreground transition"
        >
          ← Retour au leaderboard
        </Link>
      )}

      <GameStatsView
        gameName={game.name}
        headerUrl={getSteamHeaderUrl(game.steam_app_id)}
        stats={stats}
        subtitle={`Stats de ${profile.username}${isMe ? " (toi)" : ""}`}
      />

      {!isMe && (
        <div className="card text-sm text-muted">
          Tu consultes le profil public de <span className="text-foreground">{profile.username}</span>.
        </div>
      )}
    </div>
  );
}
