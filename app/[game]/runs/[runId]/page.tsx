import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { RunDetailView } from "@/components/RunDetailView";
import { fetchGameBySlug, fetchOwnedRun } from "@/lib/game-data";

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ game: string; runId: string }>;
}) {
  const { game: gameSlug, runId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const game = await fetchGameBySlug(supabase, gameSlug);
  if (!game) notFound();

  const run = await fetchOwnedRun(supabase, runId, game.id, user.id);
  if (!run) notFound();

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, name, sort_order")
    .eq("game_id", game.id)
    .order("sort_order");

  return (
    <RunDetailView
      gameSlug={gameSlug}
      gameName={game.name}
      run={run}
      chapters={chapters ?? []}
    />
  );
}
