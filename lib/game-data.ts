import type { SupabaseClient } from "@supabase/supabase-js";
import { buildRunDetail, type ComparePlayerOption, type CompareRunOption } from "@/lib/compare-runs";
import { getProfile } from "@/lib/profiles";
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

export async function fetchRunDetail(
  supabase: SupabaseClient,
  runId: string,
  gameId: string
) {
  const { data: run } = await supabase
    .from("runs")
    .select(
      "id, user_id, run_date, total_time_seconds, total_deaths, intro_time_seconds, comment, categories(name)"
    )
    .eq("id", runId)
    .eq("game_id", gameId)
    .single();

  if (!run) return null;

  const profile = await getProfile(supabase, run.user_id);
  const username = profile?.username ?? "Joueur";

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, name, sort_order")
    .eq("game_id", gameId)
    .order("sort_order");

  const { data: splits } = await supabase
    .from("run_splits")
    .select("chapter_id, time_seconds, deaths")
    .eq("run_id", runId);

  return buildRunDetail(run, chapters ?? [], splits ?? [], username);
}

type RawRunRow = {
  id: string;
  user_id: string;
  run_date: string;
  total_time_seconds: number;
  total_deaths: number | null;
  categories: { name: string } | { name: string }[] | null;
};

function toCompareRunOption(run: RawRunRow): CompareRunOption {
  const categories = run.categories;
  const category_name = Array.isArray(categories)
    ? categories[0]?.name ?? null
    : categories?.name ?? null;

  return {
    id: run.id,
    run_date: run.run_date,
    total_time_seconds: Number(run.total_time_seconds),
    total_deaths: run.total_deaths,
    category_name,
  };
}

export async function fetchComparePickerData(
  supabase: SupabaseClient,
  gameId: string,
  currentUserId: string
) {
  const { data: runs } = await supabase
    .from("runs")
    .select("id, user_id, run_date, total_time_seconds, total_deaths, categories(name)")
    .eq("game_id", gameId)
    .order("run_date", { ascending: false });

  const byUser = new Map<string, CompareRunOption[]>();
  for (const run of (runs ?? []) as RawRunRow[]) {
    const list = byUser.get(run.user_id) ?? [];
    list.push(toCompareRunOption(run));
    byUser.set(run.user_id, list);
  }

  const userIds = [...byUser.keys()];
  const profiles = await Promise.all(userIds.map((id) => getProfile(supabase, id)));
  const usernameMap = new Map(
    profiles.filter(Boolean).map((p) => [p!.id, p!.username])
  );

  const myRuns = byUser.get(currentUserId) ?? [];
  const otherPlayers: ComparePlayerOption[] = userIds
    .filter((id) => id !== currentUserId)
    .map((userId) => ({
      userId,
      username: usernameMap.get(userId) ?? "Joueur",
      runs: byUser.get(userId) ?? [],
    }))
    .sort((a, b) => a.username.localeCompare(b.username, "fr"));

  return { myRuns, otherPlayers };
}

export async function fetchUserRunsList(
  supabase: SupabaseClient,
  gameId: string,
  userId: string
): Promise<CompareRunOption[]> {
  const { data: runs } = await supabase
    .from("runs")
    .select("id, user_id, run_date, total_time_seconds, total_deaths, categories(name)")
    .eq("game_id", gameId)
    .eq("user_id", userId)
    .order("run_date", { ascending: false });

  return ((runs ?? []) as RawRunRow[]).map(toCompareRunOption);
}

export function getSteamHeaderUrl(steamAppId: number | null | undefined) {
  return steamAppId
    ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${steamAppId}/header.jpg`
    : null;
}
