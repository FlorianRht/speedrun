"use client";

import { useState } from "react";
import { addRun } from "@/lib/actions";
import { ScreenshotImport } from "./ScreenshotImport";

type Category = { id: string; name: string };
type Chapter = { id: string; name: string; sort_order: number };

export function AddRunForm({
  gameSlug,
  gameName,
  categories,
  chapters,
}: {
  gameSlug: string;
  gameName: string;
  categories: Category[];
  chapters: Chapter[];
}) {
  const today = new Date().toISOString().split("T")[0];

  const [totalTime, setTotalTime] = useState("");
  const [chapterData, setChapterData] = useState<Record<string, { time: string; deaths: string }>>(
    () => Object.fromEntries(chapters.map((c) => [c.id, { time: "", deaths: "" }]))
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
    // Les chapitres sont dans le même ordre que l'écran Progress du jeu
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
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-display">Nouvelle run</h1>
        <p className="text-muted text-sm mt-1">
          Entre tes temps comme en jeu (ex: <span className="font-mono">34:16.830</span> ou{" "}
          <span className="font-mono">1:27:51.938</span>)
        </p>
      </div>

      {/* Screenshot import */}
      <ScreenshotImport
        chapterIds={chapters.map((c) => ({ id: c.id, name: c.name }))}
        onParsed={handleParsed}
      />

      {imported && (
        <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
          Screenshot importé ! Vérifie les données ci-dessous avant d'enregistrer.
        </p>
      )}

      <form action={addRun} className="space-y-6">
        <input type="hidden" name="gameSlug" value={gameSlug} />

        {/* Main info */}
        <div className="card space-y-5">
          <h2 className="font-semibold font-display text-sm text-muted uppercase tracking-wide">
            Infos générales
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="label">Date</label>
              <input className="input !py-2.5" type="date" name="runDate" defaultValue={today} required />
            </div>
            <div>
              <label className="label">Catégorie</label>
              <select className="input !py-2.5" name="categoryId" required>
                <option value="">-- Choisir --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
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
            />
          </div>
        </div>

        {/* Splits */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold font-display text-sm text-muted uppercase tracking-wide">
              Splits par chapitre
            </h2>
            <span className="text-xs text-muted">(optionnel)</span>
          </div>

          <div
            className="rounded-xl overflow-hidden border"
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
                  placeholder="mm:ss.cc"
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

        {/* Submit */}
        <div
          className="sticky bottom-0 py-4 -mx-6 px-6"
          style={{
            background: "linear-gradient(to top, var(--background) 60%, transparent)",
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <button type="submit" className="btn-primary text-base px-8 py-3">
              Enregistrer la run
            </button>
            <span className="text-xs text-muted">
              Les splits sont optionnels, seul le temps total est requis.
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
