import Link from "next/link";
import type { CompareRunOption } from "@/lib/compare-runs";
import { formatSeconds } from "@/lib/time";

export function PlayerRunsCompare({
  runs,
  gameSlug,
  username,
  isMe,
}: {
  runs: CompareRunOption[];
  gameSlug: string;
  username: string;
  isMe: boolean;
}) {
  if (runs.length === 0) return null;

  return (
    <div className="card card-mobile space-y-3">
      <h2 className="font-semibold font-display text-sm md:text-base">
        {isMe ? "Tes runs" : `Runs de ${username}`}
      </h2>

      <div className="space-y-2">
        {runs.map((run) => (
          <div
            key={run.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl p-3"
            style={{ background: "var(--surface)", border: "1px solid var(--card-border)" }}
          >
            <div className="min-w-0">
              <p className="font-mono font-bold text-berry">{formatSeconds(run.total_time_seconds)}</p>
              <p className="text-xs text-muted mt-0.5">
                {new Date(run.run_date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {run.total_deaths !== null ? ` · ${run.total_deaths} morts` : ""}
              </p>
            </div>
            {!isMe && (
              <Link
                href={`/${gameSlug}/runs/compare?b=${run.id}`}
                className="btn-secondary text-sm px-3 py-1.5 min-h-0 shrink-0"
              >
                Comparer avec moi
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
