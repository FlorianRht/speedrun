"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { ComparePlayerOption, CompareRunOption } from "@/lib/compare-runs";
import { formatSeconds } from "@/lib/time";

function runLabel(run: CompareRunOption): string {
  const date = new Date(run.run_date).toLocaleDateString("fr-FR");
  return `${formatSeconds(run.total_time_seconds)} — ${date}${run.category_name ? ` (${run.category_name})` : ""}`;
}

type Props = {
  gameSlug: string;
  gameName: string;
  myRuns: CompareRunOption[];
  otherPlayers: ComparePlayerOption[];
  initialA?: string;
  initialB?: string;
};

export function RunCompareForm({
  gameSlug,
  gameName,
  myRuns,
  otherPlayers,
  initialA,
  initialB,
}: Props) {
  const router = useRouter();

  const initialPlayerId = useMemo(() => {
    if (!initialB) return otherPlayers[0]?.userId ?? "";
    for (const player of otherPlayers) {
      if (player.runs.some((r) => r.id === initialB)) return player.userId;
    }
    return otherPlayers[0]?.userId ?? "";
  }, [initialB, otherPlayers]);

  const [runAId, setRunAId] = useState(initialA ?? myRuns[0]?.id ?? "");
  const [playerId, setPlayerId] = useState(initialPlayerId);
  const [runBId, setRunBId] = useState(initialB ?? "");

  const selectedPlayer = otherPlayers.find((p) => p.userId === playerId);
  const opponentRuns = selectedPlayer?.runs ?? [];

  const effectiveRunBId =
    runBId && opponentRuns.some((r) => r.id === runBId)
      ? runBId
      : opponentRuns[0]?.id ?? "";

  function handlePlayerChange(nextPlayerId: string) {
    setPlayerId(nextPlayerId);
    const nextPlayer = otherPlayers.find((p) => p.userId === nextPlayerId);
    setRunBId(nextPlayer?.runs[0]?.id ?? "");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!runAId || !effectiveRunBId || runAId === effectiveRunBId) return;
    router.push(`/${gameSlug}/runs/compare?a=${runAId}&b=${effectiveRunBId}`);
  }

  const canSubmit =
    runAId && effectiveRunBId && runAId !== effectiveRunBId && myRuns.length > 0 && opponentRuns.length > 0;

  return (
    <div className="space-y-5 md:space-y-6 min-w-0">
      <div className="space-y-2">
        <Link
          href={`/${gameSlug}/runs`}
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Retour au journal
        </Link>
        <h1 className="text-xl md:text-2xl font-bold font-display">{gameName} — Comparer des runs</h1>
        <p className="text-sm text-muted">
          Compare ta run avec celle d&apos;un autre joueur, segment par segment.
        </p>
      </div>

      {myRuns.length === 0 ? (
        <div className="card card-mobile text-muted text-sm">
          Tu n&apos;as pas encore de run enregistrée pour ce jeu.{" "}
          <Link href={`/${gameSlug}/add`} className="text-berry hover:underline">
            Ajouter une run
          </Link>
        </div>
      ) : otherPlayers.length === 0 ? (
        <div className="card card-mobile text-muted text-sm">
          Aucun autre joueur n&apos;a de run sur ce jeu pour l&apos;instant.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card card-mobile space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor="run-a" className="label mb-0">
                Ta run
              </label>
              <select
                id="run-a"
                value={runAId}
                onChange={(e) => setRunAId(e.target.value)}
                className="input"
              >
                {myRuns.map((run) => (
                  <option key={run.id} value={run.id}>
                    {runLabel(run)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <label htmlFor="player-b" className="label mb-0">
                  Joueur adverse
                </label>
                <select
                  id="player-b"
                  value={playerId}
                  onChange={(e) => handlePlayerChange(e.target.value)}
                  className="input"
                >
                  {otherPlayers.map((player) => (
                    <option key={player.userId} value={player.userId}>
                      {player.username}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="run-b" className="label mb-0">
                  Sa run
                </label>
                <select
                  id="run-b"
                  value={effectiveRunBId}
                  onChange={(e) => setRunBId(e.target.value)}
                  className="input"
                  disabled={opponentRuns.length === 0}
                >
                  {opponentRuns.map((run) => (
                    <option key={run.id} value={run.id}>
                      {runLabel(run)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button type="submit" disabled={!canSubmit} className="btn-primary w-full md:w-auto">
            Comparer
          </button>
        </form>
      )}
    </div>
  );
}
