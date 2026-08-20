import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { AddRunForm } from "@/components/AddRunForm";
import { fetchGameBySlug, fetchOwnedRun } from "@/lib/game-data";

export default async function EditRunPage({
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

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("game_id", game.id)
    .order("name");

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, name, sort_order")
    .eq("game_id", game.id)
    .order("sort_order");

  return (
    <AddRunForm
      gameSlug={game.slug}
      gameName={game.name}
      categories={categories ?? []}
      chapters={chapters ?? []}
      initial={{
        id: run.id,
        run_date: run.run_date,
        total_time_seconds: run.total_time_seconds,
        comment: run.comment,
        category_id: run.category_id,
        splits: run.splits,
      }}
    />
  );
}
