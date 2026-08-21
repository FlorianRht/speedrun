"use client";

import Link from "next/link";
import { useState } from "react";
import { DeleteRunButton } from "@/components/DeleteRunButton";
import { formatSeconds } from "@/lib/time";

export type RunListItem = {
  id: string;
  run_date: string;
  total_time_seconds: number;
  total_deaths: number | null;
  comment: string | null;
  suspicious?: boolean;
  suspiciousReason?: string | null;
};

function WarningIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
    </svg>
  );
}

export function RunsList({
  runs,
  gameSlug,
  gameName,
}: {
  runs: RunListItem[];
  gameSlug: string;
  gameName: string;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const suspiciousCount = runs.filter((r) => r.suspicious).length;

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  const oneSelected = selected.length === 1;
  const twoSelected = selected.length === 2;
  const compareHref = twoSelected
    ? `/${gameSlug}/runs/compare?a=${selected[0]}&b=${selected[1]}`
    : oneSelected
      ? `/${gameSlug}/runs/compare?a=${selected[0]}`
      : "#";

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold font-display">{gameName} — Journal des runs</h1>
        <Link
          href={`/${gameSlug}/runs/compare`}
          className="btn-secondary text-sm px-4 py-2 min-h-0"
        >
          Comparer avec un joueur
        </Link>
      </div>

      {runs.length > 0 && (
        <p className="text-xs text-muted">
          Sélectionne une run pour la comparer à celle d&apos;un autre joueur, ou deux de tes runs entre elles.
          {suspiciousCount > 0 && (
            <>
              {" "}
              <span className="text-red-400">
                {suspiciousCount} run{suspiciousCount > 1 ? "s" : ""} à vérifier
              </span>
              .
            </>
          )}
        </p>
      )}

      {(oneSelected || twoSelected) && (
        <div
          className="sticky top-14 z-40 flex items-center justify-between gap-3 rounded-xl px-4 py-3"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
        >
          <span className="text-sm">
            {twoSelected ? "2 runs sélectionnées" : "1 run sélectionnée"}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelected([])}
              className="btn-secondary text-sm px-3 py-1.5 min-h-0"
            >
              Annuler
            </button>
            <Link href={compareHref} className="btn-primary text-sm px-4 py-1.5 min-h-0">
              {twoSelected ? "Comparer" : "Choisir l'adversaire"}
            </Link>
          </div>
        </div>
      )}

      <div className="lg:hidden space-y-2">
        {runs.map((run) => {
          const isSelected = selected.includes(run.id);
          return (
            <div
              key={run.id}
              className={`card card-mobile ${
                isSelected
                  ? "ring-2 ring-berry/60"
                  : run.suspicious
                    ? "ring-1 ring-red-400/50"
                    : ""
              }`}
              style={
                run.suspicious
                  ? { background: "color-mix(in srgb, #f87171 8%, var(--card))" }
                  : undefined
              }
            >
              <div className="flex items-start gap-3">
                {runs.length > 0 && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(run.id)}
                    className="mt-1.5 h-4 w-4 rounded accent-[#b044e0] shrink-0 cursor-pointer"
                    aria-label={`Sélectionner la run du ${new Date(run.run_date).toLocaleDateString("fr-FR")}`}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <Link href={`/${gameSlug}/runs/${run.id}`} className="block group/link">
                    <div className="flex items-baseline justify-between gap-2">
                      <p
                        className={`font-mono text-lg font-bold group-hover/link:underline ${
                          run.suspicious ? "text-red-400" : "text-berry"
                        }`}
                      >
                        {formatSeconds(run.total_time_seconds)}
                      </p>
                      <span className="text-xs text-muted shrink-0">
                        {new Date(run.run_date).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-muted mt-1">
                      <span>{run.total_deaths} morts</span>
                      {run.suspicious && (
                        <span className="inline-flex items-center gap-1 text-red-400 font-medium">
                          <WarningIcon className="w-3.5 h-3.5" />
                          À vérifier
                        </span>
                      )}
                    </div>
                    {run.suspicious && (
                      <p className="text-xs text-red-400/90 mt-1.5">
                        Cette run semble incohérente.
                      </p>
                    )}
                    {run.comment && (
                      <p className="text-sm text-muted mt-2 line-clamp-2">{run.comment}</p>
                    )}
                  </Link>
                </div>
                <DeleteRunButton runId={run.id} gameSlug={gameSlug} />
              </div>
            </div>
          );
        })}
        {runs.length === 0 && (
          <div className="card card-mobile text-center text-muted py-8">
            Aucune run pour l&apos;instant.
          </div>
        )}
      </div>

      <div className="hidden lg:block card max-w-full overflow-hidden">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-border">
              {runs.length > 0 && <th className="py-2 pr-2 font-medium w-10"></th>}
              <th className="py-2 pr-2 font-medium w-[16%]">Date</th>
              <th className="py-2 pr-2 font-medium w-[18%]">Temps</th>
              <th className="py-2 pr-2 font-medium w-[12%]">Morts</th>
              <th className="py-2 pr-2 font-medium">Commentaire</th>
              <th className="py-2 font-medium w-24"></th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => {
              const isSelected = selected.includes(run.id);
              return (
                <tr
                  key={run.id}
                  className={`border-b border-border last:border-0 group ${
                    isSelected ? "bg-berry/5" : run.suspicious ? "bg-red-500/5" : ""
                  }`}
                  title={run.suspiciousReason ?? undefined}
                >
                  {runs.length > 0 && (
                    <td className="py-2 pr-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggle(run.id)}
                        className="h-4 w-4 rounded accent-[#b044e0] cursor-pointer"
                        aria-label={`Sélectionner la run du ${new Date(run.run_date).toLocaleDateString("fr-FR")}`}
                      />
                    </td>
                  )}
                  <td className="py-2 pr-2 truncate">
                    <Link
                      href={`/${gameSlug}/runs/${run.id}`}
                      className="hover:text-berry transition inline-flex items-center gap-1.5"
                    >
                      {run.suspicious && <WarningIcon className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                      {new Date(run.run_date).toLocaleDateString("fr-FR")}
                    </Link>
                  </td>
                  <td className="py-2 pr-2 font-mono truncate">
                    <Link
                      href={`/${gameSlug}/runs/${run.id}`}
                      className={`hover:underline ${run.suspicious ? "text-red-400 font-medium" : "text-berry"}`}
                    >
                      {formatSeconds(run.total_time_seconds)}
                    </Link>
                  </td>
                  <td className="py-2 pr-2">{run.total_deaths}</td>
                  <td className="py-2 pr-2 text-muted truncate">
                    {run.suspicious && !run.comment ? (
                      <span className="text-red-400/90">Run incohérente</span>
                    ) : (
                      run.comment
                    )}
                  </td>
                  <td className="py-2">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/${gameSlug}/runs/${run.id}/edit`}
                        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-muted hover:text-foreground transition p-2 md:p-1 rounded"
                        title="Modifier"
                        aria-label="Modifier cette run"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <DeleteRunButton runId={run.id} gameSlug={gameSlug} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {runs.length === 0 && (
              <tr>
                <td colSpan={runs.length > 0 ? 6 : 5} className="py-6 text-center text-muted">
                  Aucune run pour l&apos;instant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
