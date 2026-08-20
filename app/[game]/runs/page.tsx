import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RunsList } from "@/components/RunsList";

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
    .select("id, run_date, total_time_seconds, total_deaths, comment")
    .eq("game_id", game.id)
    .eq("user_id", user.id)
    .order("run_date", { ascending: false });

  const runItems = (runs ?? []).map((run) => ({
    id: run.id,
    run_date: run.run_date,
    total_time_seconds: Number(run.total_time_seconds),
    total_deaths: run.total_deaths,
    comment: run.comment,
  }));

  return <RunsList runs={runItems} gameSlug={gameSlug} gameName={game.name} />;
}
