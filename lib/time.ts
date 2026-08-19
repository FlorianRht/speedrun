/**
 * Parse un temps tapé comme en jeu : "34:16.830" (mm:ss.cc) ou "1:27:51.938" (h:mm:ss.cc)
 * en un nombre total de secondes.
 */
export function parseTimeToSeconds(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(":");
  if (parts.length === 2) {
    const [m, s] = parts;
    const minutes = Number(m);
    const seconds = Number(s);
    if (Number.isNaN(minutes) || Number.isNaN(seconds)) return null;
    return minutes * 60 + seconds;
  }
  if (parts.length === 3) {
    const [h, m, s] = parts;
    const hours = Number(h);
    const minutes = Number(m);
    const seconds = Number(s);
    if ([hours, minutes, seconds].some(Number.isNaN)) return null;
    return hours * 3600 + minutes * 60 + seconds;
  }
  return null;
}

/**
 * Formate un nombre de secondes en "mm:ss.cc", ou "h:mm:ss.cc" si >= 1h.
 */
export function formatSeconds(totalSeconds: number | null | undefined): string {
  if (totalSeconds === null || totalSeconds === undefined || Number.isNaN(totalSeconds)) {
    return "-";
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const secStr = seconds.toFixed(2).padStart(5, "0");

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${secStr}`;
  }
  return `${String(minutes).padStart(2, "0")}:${secStr}`;
}
