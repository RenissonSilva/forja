/** Longest duration the MM:SS mask can hold (99:59). */
export const MAX_DURATION_SECONDS = 99 * 60 + 59;

const MAX_DURATION_DIGITS = 4;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** 90 → "01:30". */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  return `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
}

/**
 * Keeps only what the MM:SS mask can hold from typed text, filled from the right:
 * "1" → "1", "00:451" → "451". Returns null once more than four digits are typed.
 */
export function durationDigits(text: string): string | null {
  const digits = text.replace(/\D/g, "").replace(/^0+/, "");
  return digits.length > MAX_DURATION_DIGITS ? null : digits;
}

/** "451" → "04:51" — the mask shown while typing, before seconds over 59 carry over. */
export function maskDurationDigits(digits: string): string {
  const padded = digits.padStart(MAX_DURATION_DIGITS, "0");
  return `${padded.slice(0, 2)}:${padded.slice(2)}`;
}

/** "451" → 291 seconds; "190" → 01:90 → 150 seconds. */
export function durationDigitsToSeconds(digits: string): number {
  const padded = digits.padStart(MAX_DURATION_DIGITS, "0");
  const seconds = Number(padded.slice(0, 2)) * 60 + Number(padded.slice(2));
  return Math.min(seconds, MAX_DURATION_SECONDS);
}
