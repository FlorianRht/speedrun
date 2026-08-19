import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ensureProfile, getProfile } from "@/lib/profiles";
import { HomeHeader } from "@/components/HomeHeader";
import { HomeView, type HomeGame } from "@/components/HomeView";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await ensureProfile(supabase, user);

  const profile = await getProfile(supabase, user.id);
  const username = profile?.username ?? "Joueur";

  const { data: games } = await supabase
    .from("games")
    .select("id, slug, name, steam_app_id")
    .order("name");

  const { data: runs } = await supabase
    .from("runs")
    .select("game_id, total_time_seconds, run_date")
    .eq("user_id", user.id);

  const statsByGame = new Map<
    string,
    { totalRuns: number; bestTime: number | null; lastRunDate: string | null }
  >();

  for (const run of runs ?? []) {
    const existing = statsByGame.get(run.game_id) ?? {
      totalRuns: 0,
      bestTime: null,
      lastRunDate: null,
    };
    const time = Number(run.total_time_seconds);
    existing.totalRuns += 1;
    existing.bestTime =
      existing.bestTime === null ? time : Math.min(existing.bestTime, time);
    if (!existing.lastRunDate || run.run_date > existing.lastRunDate) {
      existing.lastRunDate = run.run_date;
    }
    statsByGame.set(run.game_id, existing);
  }

  const homeGames: HomeGame[] = (games ?? []).map((g) => {
    const stats = statsByGame.get(g.id);
    return {
      slug: g.slug,
      name: g.name,
      steamAppId: g.steam_app_id,
      totalRuns: stats?.totalRuns ?? 0,
      bestTime: stats?.bestTime ?? null,
      lastRunDate: stats?.lastRunDate ?? null,
    };
  });

  return (
    <>
      <HomeHeader />
      <HomeView username={username} games={homeGames} />
    </>
  );
}
