import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GameStatsView } from "@/components/GameStatsView";
import { fetchGameBySlug, fetchUserGameStats, getSteamHeaderUrl } from "@/lib/game-data";

export default async function GameStatsPage({ params }: { params: Promise<{ game: string }> }) {
  const { game: gameSlug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const game = await fetchGameBySlug(supabase, gameSlug);
  if (!game) return null;

  const stats = await fetchUserGameStats(supabase, game.id, user.id);

  return (
    <GameStatsView
      gameName={game.name}
      headerUrl={getSteamHeaderUrl(game.steam_app_id)}
      stats={stats}
    />
  );
}
