import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { formatSeconds } from "@/lib/time";
import { fetchGameBySlug } from "@/lib/game-data";
import { getProfile } from "@/lib/profiles";

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ game: string }>;
}) {
  const { game: gameSlug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const game = await fetchGameBySlug(supabase, gameSlug);
  if (!game) notFound();

  const { data: runs } = await supabase
    .from("runs")
    .select("id, user_id, total_time_seconds, total_deaths, run_date")
    .eq("game_id", game.id);

  const bestByUser = new Map<
    string,
    {
      runId: string;
      time: number;
      deaths: number;
      date: string;
    }
  >();

  for (const run of runs ?? []) {
    const time = Number(run.total_time_seconds);
    const existing = bestByUser.get(run.user_id);
    if (!existing || time < existing.time) {
      bestByUser.set(run.user_id, {
        runId: run.id,
        time,
        deaths: run.total_deaths ?? 0,
        date: run.run_date,
      });
    }
  }

  const userIds = [...bestByUser.keys()];
  const profiles = await Promise.all(userIds.map((id) => getProfile(supabase, id)));
  const profileMap = new Map(
    profiles.filter(Boolean).map((p) => [p!.id, p!.username])
  );

  const leaderboard = userIds
    .map((userId) => ({
      userId,
      username: profileMap.get(userId) ?? "Joueur",
      isMe: userId === user.id,
      ...bestByUser.get(userId)!,
    }))
    .sort((a, b) => a.time - b.time);

  return (
    <div className="space-y-5 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold font-display">{game.name} — Leaderboard</h1>
        <p className="text-sm text-muted mt-1">Meilleur temps par joueur</p>
      </div>

      <div className="lg:hidden space-y-2">
        {leaderboard.map((entry, i) => (
          <div
            key={entry.userId}
            className={`card card-mobile ${entry.isMe ? "ring-1 ring-berry/30" : ""}`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i === 0
                    ? "bg-berry/20 text-berry"
                    : i === 1
                      ? "bg-foreground/10 text-foreground"
                      : i === 2
                        ? "bg-foreground/5 text-muted"
                        : "text-muted"
                }`}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/${gameSlug}/player/${entry.userId}`}
                  className="font-medium hover:text-berry transition block truncate"
                >
                  {entry.username}
                  {entry.isMe && <span className="ml-1.5 text-xs text-berry">(toi)</span>}
                </Link>
                <p className="font-mono text-lg font-bold text-berry mt-0.5">
                  {formatSeconds(entry.time)}
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted mt-1">
                  <span>{entry.deaths} morts</span>
                  <span>{new Date(entry.date).toLocaleDateString("fr-FR")}</span>
                </div>
                {!entry.isMe && (
                  <Link
                    href={`/${gameSlug}/runs/compare?b=${entry.runId}`}
                    className="inline-block mt-2 text-xs text-berry hover:underline"
                  >
                    Comparer avec moi
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
        {leaderboard.length === 0 && (
          <div className="card card-mobile text-center text-muted py-8">
            Aucune run enregistrée pour l&apos;instant.
          </div>
        )}
      </div>

      <div className="hidden lg:block card max-w-full overflow-hidden">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-border">
              <th className="py-2 pr-2 font-medium w-10">#</th>
              <th className="py-2 pr-2 font-medium w-[28%]">Joueur</th>
              <th className="py-2 pr-2 font-medium w-[22%]">Temps</th>
              <th className="py-2 pr-2 font-medium w-[14%]">Morts</th>
              <th className="py-2 pr-2 font-medium w-[18%]">Date</th>
              <th className="py-2 pr-2 font-medium w-[14%]"></th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, i) => (
              <tr
                key={entry.userId}
                className={`border-b border-border last:border-0 ${entry.isMe ? "bg-berry/5" : ""}`}
              >
                <td className="py-3 pr-2 text-muted font-medium">{i + 1}</td>
                <td className="py-3 pr-2 truncate">
                  <Link
                    href={`/${gameSlug}/player/${entry.userId}`}
                    className="font-medium hover:text-berry transition"
                  >
                    {entry.username}
                    {entry.isMe && (
                      <span className="ml-2 text-xs text-berry">(toi)</span>
                    )}
                  </Link>
                </td>
                <td className="py-3 pr-2 font-mono font-medium text-berry truncate">
                  {formatSeconds(entry.time)}
                </td>
                <td className="py-3 pr-2">{entry.deaths}</td>
                <td className="py-3 pr-2 text-muted truncate">
                  {new Date(entry.date).toLocaleDateString("fr-FR")}
                </td>
                <td className="py-3 pr-2">
                  {!entry.isMe && (
                    <Link
                      href={`/${gameSlug}/runs/compare?b=${entry.runId}`}
                      className="text-xs text-berry hover:underline whitespace-nowrap"
                    >
                      Comparer
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {leaderboard.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted">
                  Aucune run enregistrée pour l&apos;instant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
