import Link from "next/link";
import { formatSeconds } from "@/lib/time";

export type HomeGame = {
  slug: string;
  name: string;
  steamAppId: number | null;
  totalRuns: number;
  bestTime: number | null;
  lastRunDate: string | null;
};

export function HomeView({ username, games }: { username: string; games: HomeGame[] }) {
  const totalRuns = games.reduce((sum, g) => sum + g.totalRuns, 0);

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 min-w-0 overflow-x-hidden space-y-8 md:space-y-10">
        <section className="space-y-2">
          <p className="text-sm text-muted">Bienvenue</p>
          <h1 className="text-3xl md:text-4xl font-bold font-display">
            Salut, <span className="text-berry">{username}</span>
          </h1>
          <p className="text-muted text-sm md:text-base max-w-lg">
            {games.length === 1
              ? "Retrouve tes stats, ton classement et ton journal de runs."
              : "Choisis un jeu pour suivre ta progression speedrun."}
          </p>
        </section>

        {totalRuns > 0 && (
          <section className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <StatPill label="Jeux suivis" value={String(games.filter((g) => g.totalRuns > 0).length)} />
            <StatPill label="Runs totales" value={String(totalRuns)} />
            <StatPill
              label="Jeux actifs"
              value={String(games.length)}
              className="hidden md:block"
            />
          </section>
        )}

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Tes jeux</h2>

          <div className={`grid gap-4 ${games.length > 1 ? "md:grid-cols-2" : ""}`}>
            {games.map((game) => (
              <GameCard key={game.slug} game={game} featured={games.length === 1} />
            ))}
          </div>

          {games.length === 0 && (
            <div className="card card-mobile text-center py-12 text-muted">
              Aucun jeu configuré pour l&apos;instant.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`card card-mobile ${className}`}>
      <p className="text-xs text-muted">{label}</p>
      <p className="text-xl font-bold font-display mt-0.5">{value}</p>
    </div>
  );
}

function GameCard({ game, featured }: { game: HomeGame; featured?: boolean }) {
  const headerUrl = game.steamAppId
    ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.steamAppId}/header.jpg`
    : null;

  return (
    <article
      className={`card card-mobile overflow-hidden p-0 flex flex-col ${
        featured ? "md:flex-row md:min-h-[220px]" : ""
      }`}
    >
      <Link
        href={`/${game.slug}`}
        className={`group relative overflow-hidden shrink-0 ${
          featured ? "md:w-[45%] h-40 md:h-auto" : "h-32"
        }`}
      >
        {headerUrl ? (
          <img
            src={headerUrl}
            alt={game.name}
            className="absolute inset-0 w-full h-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: "color-mix(in srgb, var(--berry) 15%, var(--card))" }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent md:bg-gradient-to-r md:from-background/80 md:via-background/30 md:to-transparent" />
        <div className="relative h-full flex items-end p-4 md:p-5">
          <h3 className="font-bold font-display text-xl md:text-2xl">{game.name}</h3>
        </div>
      </Link>

      <div className={`flex flex-col justify-between gap-4 p-4 md:p-5 ${featured ? "flex-1" : ""}`}>
        <div className="space-y-2">
          {game.totalRuns > 0 ? (
            <>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span>
                  <span className="text-muted">Runs </span>
                  <span className="font-medium">{game.totalRuns}</span>
                </span>
                {game.bestTime !== null && (
                  <span>
                    <span className="text-muted">PB </span>
                    <span className="font-mono font-medium text-berry">
                      {formatSeconds(game.bestTime)}
                    </span>
                  </span>
                )}
              </div>
              {game.lastRunDate && (
                <p className="text-xs text-muted">
                  Dernière run le{" "}
                  {new Date(game.lastRunDate).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted">Aucune run enregistrée pour l&apos;instant.</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/${game.slug}`}
            className="btn-primary text-sm px-4 py-2 min-h-0"
          >
            Voir mes stats
          </Link>
          <Link
            href={`/${game.slug}/add`}
            className="btn-secondary text-sm px-4 py-2 min-h-0"
          >
            Ajouter une run
          </Link>
        </div>
      </div>
    </article>
  );
}
