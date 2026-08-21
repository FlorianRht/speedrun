/** Écart attendu entre total et somme des splits (marge "environ 30–40 s"). */
export const TIMING_GAP_MIN_SECONDS = 28;
export const TIMING_GAP_MAX_SECONDS = 45;

export type RunTimingCheck = {
  ok: boolean;
  /** true si des splits permettent de vérifier */
  checkable: boolean;
  gapSeconds: number | null;
  splitsSum: number;
  message: string | null;
};

/**
 * Une run est suspecte si elle a des splits renseignés et que
 * total − somme(splits) n'est pas dans la plage attendue (~30–40 s).
 * Les messages UI restent volontairement génériques (pas de détail "intro").
 */
export function checkRunTiming(
  totalTimeSeconds: number,
  splitTimes: (number | null | undefined)[]
): RunTimingCheck {
  const validSplits = splitTimes
    .map((t) => (t == null || Number.isNaN(Number(t)) ? null : Number(t)))
    .filter((t): t is number => t !== null && t > 0);

  if (validSplits.length === 0) {
    return {
      ok: true,
      checkable: false,
      gapSeconds: null,
      splitsSum: 0,
      message: null,
    };
  }

  const splitsSum = validSplits.reduce((a, b) => a + b, 0);
  const gapSeconds = Number(totalTimeSeconds) - splitsSum;

  if (gapSeconds < 0) {
    return {
      ok: false,
      checkable: true,
      gapSeconds,
      splitsSum,
      message: "Cette run semble incohérente : vérifie le temps total et les splits.",
    };
  }

  if (gapSeconds < TIMING_GAP_MIN_SECONDS || gapSeconds > TIMING_GAP_MAX_SECONDS) {
    return {
      ok: false,
      checkable: true,
      gapSeconds,
      splitsSum,
      message: "Cette run semble incohérente : vérifie le temps total et les splits.",
    };
  }

  return {
    ok: true,
    checkable: true,
    gapSeconds,
    splitsSum,
    message: null,
  };
}
