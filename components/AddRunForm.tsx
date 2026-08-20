"use client";

import Link from "next/link";
import { useState } from "react";
import { addRun, updateRun } from "@/lib/actions";
import { formatSeconds } from "@/lib/time";
import { ScreenshotImport } from "./ScreenshotImport";
import { SubmitButton } from "./ui/SubmitButton";

type Chapter = { id: string; name: string; sort_order: number };

export type RunFormInitial = {
  id: string;
  run_date: string;
  total_time_seconds: number;
  comment: string | null;
  splits: { chapter_id: string; time_seconds: number | null; deaths: number | null }[];
};

export function AddRunForm({
  gameSlug,
  gameName,
  chapters,
  initial,
}: {
  gameSlug: string;
  gameName: string;
  chapters: Chapter[];
  initial?: RunFormInitial;
}) {
  const isEdit = Boolean(initial);
  const today = new Date().toISOString().split("T")[0];

  const [totalTime, setTotalTime] = useState(
    initial ? formatSeconds(initial.total_time_seconds) : ""
  );
  const [comment, setComment] = useState(initial?.comment ?? "");
  const [chapterData, setChapterData] = useState<Record<string, { time: string; deaths: string }>>(
    () =>
      Object.fromEntries(
        chapters.map((c) => {
          const split = initial?.splits.find((s) => s.chapter_id === c.id);
          return [
            c.id,
            {
              time: split?.time_seconds != null ? formatSeconds(split.time_seconds) : "",
              deaths: split?.deaths != null ? String(split.deaths) : "",
            },
          ];
        })
      )
  );
  const [imported, setImported] = useState(false);

  function handleParsed(data: {
    chapters: { name: string; deaths: number | null; time: string | null }[];
    totalDeaths: number | null;
    totalTime: string | null;
  }) {
    if (data.totalTime) {
      setTotalTime(data.totalTime);
    }

    const newChapterData = { ...chapterData };
    for (let i = 0; i < chapters.length; i++) {
      const parsed = data.chapters[i];
      if (!parsed) continue;
      newChapterData[chapters[i].id] = {
        time: parsed.time ?? "",
        deaths: parsed.deaths !== null ? String(parsed.deaths) : "",
      };
    }
    setChapterData(newChapterData);
    setImported(true);
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5 md:space-y-8 min-w-0 overflow-x-hidden">
      <div>
        {isEdit && (
          <Link
            href={`/${gameSlug}/runs/${initial!.id}`}
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition mb-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Retour au détail
          </Link>
        )}
        <h1 className="text-xl md:text-2xl font-bold font-display">
          {isEdit ? "Modifier la run" : "Nouvelle run"}
        </h1>
        <p className="text-muted text-sm mt-1">
          {isEdit ? `${gameName} — ` : ""}
          Entre tes temps comme en jeu (ex: <span className="font-mono">34:16.830</span> ou{" "}
          <span className="font-mono">1:27:51.938</span>)
        </p>
      </div>

      <ScreenshotImport
        chapterIds={chapters.map((c) => ({ id: c.id, name: c.name }))}
        onParsed={handleParsed}
      />

      {imported && (
        <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
          Screenshot importé ! Vérifie les données ci-dessous avant d&apos;enregistrer.
        </p>
      )}

      <form action={isEdit ? updateRun : addRun} className="space-y-5 md:space-y-6">
        <input type="hidden" name="gameSlug" value={gameSlug} />
        {isEdit && <input type="hidden" name="runId" value={initial!.id} />}

        <div className="card card-mobile space-y-4 md:space-y-5">
          <h2 className="font-semibold font-display text-sm text-muted uppercase tracking-wide">
            Infos générales
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 items-end">
            <div>
              <label className="label">Date</label>
              <input
                className="input !py-2.5"
                type="date"
                name="runDate"
                defaultValue={initial?.run_date ?? today}
                required
              />
            </div>
            <div>
              <label className="label">Temps total</label>
              <input
                className="input font-mono !py-2.5"
                type="text"
                name="totalTime"
                placeholder="1:27:51.938"
                value={totalTime}
                onChange={(e) => setTotalTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Commentaire (optionnel)</label>
            <input
              className="input"
              type="text"
              name="comment"
              placeholder="Ex: belle run, choke au summit..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        <div className="card card-mobile space-y-3 md:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold font-display text-sm text-muted uppercase tracking-wide">
              Splits par chapitre
            </h2>
            <span className="text-xs text-muted">(optionnel)</span>
          </div>

          <div className="lg:hidden space-y-2">
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                className="rounded-xl p-3 space-y-2.5"
                style={{ background: "var(--surface)", border: "1px solid var(--card-border)" }}
              >
                <p className="text-sm font-medium">{chapter.name}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label text-xs">Temps</label>
                    <input
                      className="input font-mono text-sm !py-2 !px-2"
                      type="text"
                      name={`chapter_time_${chapter.id}`}
                      placeholder="mm:ss.SSS"
                      value={chapterData[chapter.id]?.time ?? ""}
                      onChange={(e) =>
                        setChapterData((prev) => ({
                          ...prev,
                          [chapter.id]: { ...prev[chapter.id], time: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Morts</label>
                    <input
                      className="input text-sm !py-2 !px-2 text-center"
                      type="number"
                      min={0}
                      name={`chapter_deaths_${chapter.id}`}
                      placeholder="0"
                      value={chapterData[chapter.id]?.deaths ?? ""}
                      onChange={(e) =>
                        setChapterData((prev) => ({
                          ...prev,
                          [chapter.id]: { ...prev[chapter.id], deaths: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            className="hidden lg:block rounded-xl overflow-hidden border max-w-full"
            style={{ borderColor: "var(--card-border)" }}
          >
            <div
              className="grid grid-cols-[1fr,120px,80px] gap-3 px-4 py-2 text-xs font-medium text-muted"
              style={{ background: "var(--card)" }}
            >
              <span>Chapitre</span>
              <span>Temps</span>
              <span>Morts</span>
            </div>

            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                className="grid grid-cols-[1fr,120px,80px] gap-3 items-center px-4 py-2.5 border-t"
                style={{ borderColor: "var(--card-border)" }}
              >
                <span className="text-sm">{chapter.name}</span>
                <input
                  className="input font-mono text-sm !py-1.5 !px-2"
                  type="text"
                  name={`chapter_time_${chapter.id}`}
                  placeholder="mm:ss.SSS"
                  value={chapterData[chapter.id]?.time ?? ""}
                  onChange={(e) =>
                    setChapterData((prev) => ({
                      ...prev,
                      [chapter.id]: { ...prev[chapter.id], time: e.target.value },
                    }))
                  }
                />
                <input
                  className="input text-sm !py-1.5 !px-2 text-center"
                  type="number"
                  min={0}
                  name={`chapter_deaths_${chapter.id}`}
                  placeholder="0"
                  value={chapterData[chapter.id]?.deaths ?? ""}
                  onChange={(e) =>
                    setChapterData((prev) => ({
                      ...prev,
                      [chapter.id]: { ...prev[chapter.id], deaths: e.target.value },
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 space-y-2">
          <SubmitButton
            pendingLabel={isEdit ? "Mise à jour..." : "Enregistrement..."}
            className="w-full md:w-auto md:mx-auto md:flex text-base px-8 py-3"
          >
            {isEdit ? "Enregistrer les modifications" : "Enregistrer la run"}
          </SubmitButton>
          <p className="text-xs text-muted text-center pb-1">
            Les splits sont optionnels, seul le temps total est requis.
          </p>
        </div>
      </form>
    </div>
  );
}
