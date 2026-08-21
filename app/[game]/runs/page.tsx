import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RunsList } from "@/components/RunsList";
import { checkRunTiming } from "@/lib/run-validation";

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

  const runIds = (runs ?? []).map((r) => r.id);
  const { data: splits } = runIds.length
    ? await supabase
        .from("run_splits")
        .select("run_id, time_seconds")
        .in("run_id", runIds)
    : { data: [] as { run_id: string; time_seconds: number | null }[] };

  const splitsByRun = new Map<string, number[]>();
  for (const split of splits ?? []) {
    const list = splitsByRun.get(split.run_id) ?? [];
    if (split.time_seconds != null) list.push(Number(split.time_seconds));
    splitsByRun.set(split.run_id, list);
  }

  const runItems = (runs ?? []).map((run) => {
    const timing = checkRunTiming(Number(run.total_time_seconds), splitsByRun.get(run.id) ?? []);
    return {
      id: run.id,
      run_date: run.run_date,
      total_time_seconds: Number(run.total_time_seconds),
      total_deaths: run.total_deaths,
      comment: run.comment,
      suspicious: !timing.ok,
      suspiciousReason: timing.message,
    };
  });

  return <RunsList runs={runItems} gameSlug={gameSlug} gameName={game.name} />;
}
