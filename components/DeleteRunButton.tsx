"use client";

import { useRef, useState } from "react";
import { deleteRun } from "@/lib/actions";
import { SubmitButton } from "./ui/SubmitButton";

export function DeleteRunButton({ runId, gameSlug }: { runId: string; gameSlug: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-red-400 hover:text-red-300 transition p-2 md:p-1 rounded shrink-0"
        title="Supprimer cette run"
        aria-label="Supprimer cette run"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            className="relative rounded-2xl p-5 md:p-6 w-full max-w-sm space-y-4"
            style={{ background: "var(--surface)", border: "1px solid var(--card-border)" }}
          >
            <h3 className="text-lg font-bold font-display">Supprimer cette run ?</h3>
            <p className="text-sm text-muted">
              Cette action est irréversible. La run et tous ses splits seront définitivement supprimés.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <form ref={formRef} action={deleteRun} className="contents">
                <input type="hidden" name="runId" value={runId} />
                <input type="hidden" name="gameSlug" value={gameSlug} />
                <SubmitButton
                  variant="danger"
                  pendingLabel="Suppression..."
                  className="flex-1 md:flex-none"
                >
                  Supprimer
                </SubmitButton>
              </form>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-secondary text-sm flex-1 md:flex-none"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
