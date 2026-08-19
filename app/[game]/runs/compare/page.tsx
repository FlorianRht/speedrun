import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { RunCompareForm } from "@/components/RunCompareForm";
import { RunCompareView } from "@/components/RunCompareView";
import { fetchComparePickerData, fetchGameBySlug, fetchRunDetail } from "@/lib/game-data";

export default async function CompareRunsPage({
  params,
  searchParams,
}: {
  params: Promise<{ game: string }>;
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const { game: gameSlug } = await params;
  const { a: runAId, b: runBId } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const game = await fetchGameBySlug(supabase, gameSlug);
  if (!game) notFound();

  if (runAId && runBId && runAId !== runBId) {
    const [runA, runB] = await Promise.all([
      fetchRunDetail(supabase, runAId, game.id),
      fetchRunDetail(supabase, runBId, game.id),
    ]);

    if (runA && runB) {
      return (
        <RunCompareView
          gameSlug={gameSlug}
          gameName={game.name}
          runA={runA}
          runB={runB}
          currentUserId={user.id}
        />
      );
    }
  }

  const { myRuns, otherPlayers } = await fetchComparePickerData(supabase, game.id, user.id);

  return (
    <RunCompareForm
      gameSlug={gameSlug}
      gameName={game.name}
      myRuns={myRuns}
      otherPlayers={otherPlayers}
      initialA={runAId}
      initialB={runBId}
    />
  );
}
