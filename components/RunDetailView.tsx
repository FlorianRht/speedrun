import Link from "next/link";
import { DeleteRunButton } from "@/components/DeleteRunButton";
import type { EditableRun } from "@/lib/game-data";
import { formatSeconds } from "@/lib/time";

type Chapter = { id: string; name: string; sort_order: number };

export function RunDetailView({
  gameSlug,
  gameName,
  run,
  chapters,
}: {
  gameSlug: string;
  gameName: string;
  run: EditableRun;
  chapters: Chapter[];
}) {
  const splitByChapter = new Map(run.splits.map((s) => [s.chapter_id, s]));
  const hasAnySplit =
    run.intro_time_seconds != null ||
    run.splits.some((s) => s.time_seconds != null || (s.deaths != null && s.deaths > 0));

  const segments: { name: string; time: number | null; deaths: number | null }[] = [];
  if (run.intro_time_seconds != null || hasAnySplit) {
    segments.push({
      name: "Intro",
      time: run.intro_time_seconds,
      deaths: null,
    });
  }
  for (const chapter of chapters) {
    const split = splitByChapter.get(chapter.id);
    segments.push({
      name: chapter.name,
      time: split?.time_seconds ?? null,
      deaths: split?.deaths ?? null,
    });
  }

  return (
    <div className="space-y-5 md:space-y-6 min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2 min-w-0">
          <Link
            href={`/${gameSlug}/runs`}
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Retour au journal
          </Link>
          <h1 className="text-xl md:text-2xl font-bold font-display">{gameName} — Détail de la run</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/${gameSlug}/runs/${run.id}/edit`}
            className="btn-primary text-sm px-4 py-2 min-h-0"
          >
            Modifier
          </Link>
          <DeleteRunButton runId={run.id} gameSlug={gameSlug} />
        </div>
      </div>

      <div className="card card-mobile space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs text-muted uppercase tracking-wide font-semibold">Temps total</p>
            <p className="font-mono text-3xl font-bold text-berry mt-1">
              {formatSeconds(run.total_time_seconds)}
            </p>
          </div>
          <div className="text-right text-sm text-muted space-y-0.5">
            <p>
              {new Date(run.run_date).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p>{run.category_name ?? "Sans catégorie"}</p>
            <p>{run.total_deaths ?? 0} morts</p>
          </div>
        </div>
        {run.comment && (
          <p
            className="text-sm rounded-xl px-3 py-2"
            style={{ background: "var(--surface)", border: "1px solid var(--card-border)" }}
          >
            {run.comment}
          </p>
        )}
      </div>

      <div className="card card-mobile">
        <h2 className="font-semibold font-display mb-3 md:mb-4 text-sm md:text-base">
          Splits par chapitre
        </h2>

        {!hasAnySplit ? (
          <p className="text-sm text-muted">Aucun split renseigné pour cette run.</p>
        ) : (
          <>
            <div className="lg:hidden space-y-2">
              {segments.map((seg) => (
                <div
                  key={seg.name}
                  className="rounded-xl p-3 flex items-center justify-between gap-3"
                  style={{ background: "var(--surface)", border: "1px solid var(--card-border)" }}
                >
                  <div>
                    <p className="text-sm font-medium">{seg.name}</p>
                    {seg.deaths !== null && (
                      <p className="text-xs text-muted mt-0.5">{seg.deaths} morts</p>
                    )}
                  </div>
                  <p className="font-mono font-medium">
                    {seg.time !== null ? formatSeconds(seg.time) : "-"}
                  </p>
                </div>
              ))}
            </div>

            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted text-left border-b border-border">
                    <th className="pb-2 font-medium">Segment</th>
                    <th className="pb-2 font-medium text-right">Temps</th>
                    <th className="pb-2 font-medium text-right">Morts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {segments.map((seg) => (
                    <tr key={seg.name}>
                      <td className="py-2.5 text-muted">{seg.name}</td>
                      <td className="py-2.5 text-right font-mono">
                        {seg.time !== null ? formatSeconds(seg.time) : "-"}
                      </td>
                      <td className="py-2.5 text-right font-mono">{seg.deaths ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
