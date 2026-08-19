import type { SupabaseClient } from "@supabase/supabase-js";
import { computeGameStats } from "@/lib/stats";

export async function fetchGameBySlug(supabase: SupabaseClient, gameSlug: string) {
  const { data } = await supabase
    .from("games")
    .select("id, name, slug, steam_app_id")
    .eq("slug", gameSlug)
    .single();
  return data;
}

export async function fetchUserGameStats(
  supabase: SupabaseClient,
  gameId: string,
  userId: string
) {
  const { data: runs } = await supabase
    .from("runs")
    .select("id, run_date, total_time_seconds, total_deaths, intro_time_seconds")
    .eq("game_id", gameId)
    .eq("user_id", userId)
    .order("run_date", { ascending: true });

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, name, sort_order")
    .eq("game_id", gameId)
    .order("sort_order");

  const runIds = (runs ?? []).map((r) => r.id);
  const { data: splits } = runIds.length
    ? await supabase
        .from("run_splits")
        .select("run_id, chapter_id, time_seconds, deaths")
        .in("run_id", runIds)
    : { data: [] as { run_id: string; chapter_id: string; time_seconds: number | null; deaths: number | null }[] };

  return computeGameStats(runs ?? [], chapters ?? [], splits ?? []);
}

export function getSteamHeaderUrl(steamAppId: number | null | undefined) {
  return steamAppId
    ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${steamAppId}/header.jpg`
    : null;
}
