"use client";

import { useRef, useState } from "react";
import Tesseract from "tesseract.js";
import { Spinner } from "./ui/Spinner";

// L'écran Progress affiche toujours les chapitres dans cet ordre (EN / FR identique côté ordre)
const CHAPTER_ORDER = [
  "Forsaken City",
  "Old Site",
  "Celestial Resort",
  "Golden Ridge",
  "Mirror Temple",
  "Reflection",
  "The Summit",
  "Core",
];

const CHAPTER_COUNT = CHAPTER_ORDER.length;

type ParsedData = {
  chapters: { name: string; deaths: number | null; time: string | null }[];
  totalDeaths: number | null;
  totalTime: string | null;
};

export function ScreenshotImport({
  onParsed,
}: {
  chapterIds: { id: string; name: string }[];
  onParsed: (data: ParsedData) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    setProgress(0);
    setRawText(null);

    try {
      const result = await Tesseract.recognize(file, "eng+fra", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const text = result.data.text;
      setRawText(text);
      onParsed(parseScreenshot(text));
    } catch {
      setError("Erreur lors de la lecture de l'image. Réessaie avec un screenshot plus net.");
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  }

  function handlePaste(e: React.ClipboardEvent) {
    for (const item of e.clipboardData.items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) handleFile(file);
        break;
      }
    }
  }

  return (
    <div className="space-y-2">
      <div
        className="card card-mobile border-dashed !border-2 text-center cursor-pointer hover:border-berry/50 transition active:scale-[0.99]"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onPaste={handlePaste}
        onClick={() => inputRef.current?.click()}
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {loading ? (
          <div className="py-6 space-y-4 flex flex-col items-center">
            <Spinner size="lg" className="text-berry" />
            <div className="w-full max-w-xs space-y-2">
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--card-border)" }}>
                <div
                  className="h-full bg-berry rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-muted text-center">Analyse en cours... {progress}%</p>
            </div>
          </div>
        ) : (
          <div className="py-6 space-y-2">
            <svg className="w-8 h-8 mx-auto text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm font-medium">Importer depuis un screenshot</p>
            <p className="text-xs text-muted">Glisser, coller (Ctrl+V) ou cliquer pour sélectionner</p>
          </div>
        )}

        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
      </div>

      {rawText && (
        <details className="text-xs">
          <summary className="text-muted cursor-pointer hover:text-foreground transition">
            Voir le texte brut détecté (debug)
          </summary>
          <pre className="mt-2 p-3 rounded-lg text-muted overflow-hidden break-all whitespace-pre-wrap max-w-full" style={{ background: "var(--card)" }}>
            {rawText}
          </pre>
        </details>
      )}
    </div>
  );
}

async function preprocessImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data, width, height } = imageData;

      // Detect the white/light region (the progress table background)
      // Scan for rows and columns that are predominantly light (> 200 avg brightness)
      const THRESHOLD = 180;

      let top = 0, bottom = height - 1, left = 0, right = width - 1;

      // Find top edge
      for (let y = 0; y < height; y++) {
        let lightPixels = 0;
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (brightness > THRESHOLD) lightPixels++;
        }
        if (lightPixels > width * 0.3) { top = y; break; }
      }

      // Find bottom edge
      for (let y = height - 1; y >= top; y--) {
        let lightPixels = 0;
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (brightness > THRESHOLD) lightPixels++;
        }
        if (lightPixels > width * 0.3) { bottom = y; break; }
      }

      // Find left edge
      for (let x = 0; x < width; x++) {
        let lightPixels = 0;
        for (let y = top; y <= bottom; y++) {
          const i = (y * width + x) * 4;
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (brightness > THRESHOLD) lightPixels++;
        }
        const regionHeight = bottom - top + 1;
        if (lightPixels > regionHeight * 0.3) { left = x; break; }
      }

      // Find right edge
      for (let x = width - 1; x >= left; x--) {
        let lightPixels = 0;
        for (let y = top; y <= bottom; y++) {
          const i = (y * width + x) * 4;
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (brightness > THRESHOLD) lightPixels++;
        }
        const regionHeight = bottom - top + 1;
        if (lightPixels > regionHeight * 0.3) { right = x; break; }
      }

      // Add small padding
      const pad = 5;
      top = Math.max(0, top - pad);
      bottom = Math.min(height - 1, bottom + pad);
      left = Math.max(0, left - pad);
      right = Math.min(width - 1, right + pad);

      const cropW = right - left + 1;
      const cropH = bottom - top + 1;

      // Crop and binarize
      const outCanvas = document.createElement("canvas");
      outCanvas.width = cropW;
      outCanvas.height = cropH;
      const outCtx = outCanvas.getContext("2d")!;
      outCtx.drawImage(canvas, left, top, cropW, cropH, 0, 0, cropW, cropH);

      // Binarize: convert to high-contrast black text on white background
      const outData = outCtx.getImageData(0, 0, cropW, cropH);
      const pixels = outData.data;
      const BINARIZE_THRESHOLD = 140;
      for (let i = 0; i < pixels.length; i += 4) {
        const brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
        const val = brightness > BINARIZE_THRESHOLD ? 255 : 0;
        pixels[i] = val;
        pixels[i + 1] = val;
        pixels[i + 2] = val;
        pixels[i + 3] = 255;
      }
      outCtx.putImageData(outData, 0, 0);

      resolve(outCanvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function parseScreenshot(text: string): ParsedData {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const totalsIdx = lines.findIndex((l) => /total|totaux/i.test(l));
  const totalsLine = totalsIdx !== -1 ? lines[totalsIdx] : null;

  // Trouver la ligne d'en-tête (PROGRESS / PROGRESSION)
  const headerIdx = lines.findIndex((l) => /progress/i.test(l));
  const startIdx = headerIdx !== -1 ? headerIdx + 1 : 1;

  // Lignes entre l'en-tête et TOTALS/TOTAUX = chapitres dans l'ordre
  let chapterLines: string[];
  if (totalsIdx > startIdx) {
    chapterLines = lines.slice(startIdx, totalsIdx);
  } else {
    chapterLines = lines.slice(startIdx, startIdx + CHAPTER_COUNT);
  }

  while (chapterLines.length < CHAPTER_COUNT) chapterLines.push("");

  const chapters = CHAPTER_ORDER.map((name, i) => {
    const { deaths, time } = parseChapterLine(chapterLines[i]);
    return { name, deaths, time };
  });

  let totalDeaths: number | null = null;
  let totalTime: string | null = null;

  if (totalsLine) {
    totalTime = extractTimeWithRaw(totalsLine).time;
    const rawMatch = extractTimeWithRaw(totalsLine).rawMatch;
    let withoutTime = totalsLine;
    if (rawMatch) withoutTime = withoutTime.replace(rawMatch, "");
    withoutTime = withoutTime.replace(/total|totaux/i, "");
    const nums = [...withoutTime.matchAll(/\b(\d+)\b/g)].map((m) => parseInt(m[1], 10));
    // Format TOTALS : [fraises] [morts] [temps]
    if (nums.length >= 2) {
      totalDeaths = nums[1];
    } else if (nums.length === 1) {
      totalDeaths = nums[0];
    }
  }

  return { chapters, totalDeaths, totalTime };
}

function parseChapterLine(line: string): { deaths: number | null; time: string | null } {
  if (!line.trim()) return { deaths: null, time: null };

  const { time, rawMatch } = extractTimeWithRaw(line);
  let remaining = line;

  // Retirer le texte brut qui correspond au temps
  if (rawMatch) {
    remaining = remaining.replace(rawMatch, "");
  }

  // Retirer fraises : "0/20", "1/25", "2/47", aussi mal lu: "0/34", "o/18"
  remaining = remaining.replace(/\w?\s*\d*\s*\/\s*\d+/g, "");

  // Retirer le nom du chapitre et tout ce qui n'est pas un chiffre au début
  remaining = remaining.replace(/^[^0-9]*/, "");

  // Retirer les "o", "°", "e", "rs", parenthèses etc. (artefacts OCR d'icônes)
  remaining = remaining.replace(/[°oe()©®&]/gi, " ");
  remaining = remaining.replace(/\brs\b/gi, "");
  remaining = remaining.replace(/\bff\b/gi, "");
  remaining = remaining.replace(/\brR\b/g, "");

  // Extraire les nombres restants
  const numbers = [...remaining.matchAll(/\b(\d+)\b/g)]
    .map((m) => parseInt(m[1], 10))
    .filter((n) => n < 500); // Morts par chapitre ne dépassent raisonnablement pas 500

  // Celeste affiche : [morts blanches] [morts rouges] — on somme les deux
  const deaths = numbers.length > 0
    ? numbers.reduce((sum, n) => sum + n, 0)
    : 0;

  return { deaths, time };
}

function extractTimeWithRaw(line: string): { time: string | null; rawMatch: string | null } {
  // Format h:mm:ss.xxx (temps total)
  const full = line.match(/\d:\d{2}:\d{2}[.:]\d{2,3}/);
  if (full) return { time: full[0], rawMatch: full[0] };

  // Format standard : 1:36.866, 16:04.478, 12:21.676
  const standard = line.match(/\d{1,2}:\d{2}[.:]\d{2,3}/);
  if (standard) return { time: standard[0], rawMatch: standard[0] };

  // OCR colle les millisecondes : "43:11582" → 43:11.582, "4:29314" → 4:29.314
  const glued = line.match(/(\d{1,2}):(\d{2})(\d{3})/);
  if (glued) {
    const formatted = `${glued[1]}:${glued[2]}.${glued[3]}`;
    return { time: formatted, rawMatch: glued[0] };
  }

  // OCR met un point/virgule au mauvais endroit
  // "8.54565" → 8:54.565 (1 chiffre + sep + 5 chiffres)
  const oneFive = line.match(/\b(\d)[.,](\d{2})(\d{3})\b/);
  if (oneFive) {
    const formatted = `${oneFive[1]}:${oneFive[2]}.${oneFive[3]}`;
    return { time: formatted, rawMatch: oneFive[0] };
  }
  // "16.04478" → 16:04.478 (2 chiffres + sep + 5 chiffres)
  const twoFive = line.match(/\b(\d{2})[.,](\d{2})(\d{3})\b/);
  if (twoFive) {
    const formatted = `${twoFive[1]}:${twoFive[2]}.${twoFive[3]}`;
    return { time: formatted, rawMatch: twoFive[0] };
  }
  // "656,534" ou "810.501" → 6:56.534 (3 chiffres + sep + 3 chiffres)
  const threeThree = line.match(/\b(\d)(\d{2})[,.](\d{3})\b/);
  if (threeThree) {
    const formatted = `${threeThree[1]}:${threeThree[2]}.${threeThree[3]}`;
    return { time: formatted, rawMatch: threeThree[0] };
  }
  // "16,04.478" (2 chiffres + sep + 2 chiffres + sep + 3 chiffres)
  const commaTime = line.match(/(\d{1,2})[,.](\d{2})[.,](\d{3})/);
  if (commaTime) {
    const formatted = `${commaTime[1]}:${commaTime[2]}.${commaTime[3]}`;
    return { time: formatted, rawMatch: commaTime[0] };
  }

  // OCR sans séparateurs : 251003 → 2:51.003, 854565 → 8:54.565, 427465 → 4:27.465
  const mangledMatches = [...line.matchAll(/\b(\d{6,7})\b/g)];
  if (mangledMatches.length > 0) {
    const raw = mangledMatches[mangledMatches.length - 1][1];
    return { time: formatMangledTime(raw), rawMatch: raw };
  }

  return { time: null, rawMatch: null };
}

function formatMangledTime(digits: string): string | null {
  if (digits.length === 6) {
    return `${digits[0]}:${digits.slice(1, 3)}.${digits.slice(3)}`;
  }
  if (digits.length === 7) {
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}.${digits.slice(4)}`;
  }
  return null;
}
