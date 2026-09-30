import { ExerciseSetLog } from "@domain/entities/ExerciseLog";
import { normalizeText } from "@domain/services/exerciseNameDictionary";
import { ProgressChange, ProgressionMetric } from "@domain/services/exerciseProgression";
import { DateKey, fromDateKey } from "@shared/date-utils";
import { formatDuration } from "@shared/duration";
import { differenceInCalendarDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { colors } from "../../theme/colors";

export const metricLabels: Record<ProgressionMetric, string> = {
  load: "Carga",
  estimatedOneRepMax: "1RM est.",
  volume: "Volume",
  reps: "Reps",
  totalReps: "Total",
  duration: "Tempo",
  totalDuration: "Total",
};

export const recordLabels: Record<ProgressionMetric, string> = {
  load: "Maior carga",
  estimatedOneRepMax: "Melhor série",
  volume: "Maior volume",
  reps: "Mais reps",
  totalReps: "Maior total",
  duration: "Maior tempo",
  totalDuration: "Maior total",
};

export type Trend = "up" | "down" | "flat";

export const trendColors: Record<Trend, { text: string; background: string }> = {
  up: { text: colors.success, background: colors.successMuted },
  down: { text: colors.dangerText, background: colors.dangerMuted },
  flat: { text: colors.textSecondary, background: colors.control },
};

/** Up to one decimal, without a trailing ".0" — the same way loads show in the steppers. */
export function formatNumber(value: number): string {
  return String(Math.round(value * 10) / 10);
}

function isDurationMetric(metric: ProgressionMetric): boolean {
  return metric === "duration" || metric === "totalDuration";
}

/** Empty for durations, which read as MM:SS on their own. */
export function metricUnit(metric: ProgressionMetric): string {
  if (isDurationMetric(metric)) return "";
  return metric === "reps" || metric === "totalReps" ? "reps" : "kg";
}

/** The number alone — reps and volume are whole, loads keep their half-kilos, durations are MM:SS. */
export function formatMetricAmount(value: number, metric: ProgressionMetric): string {
  if (isDurationMetric(metric)) return formatDuration(value);
  return metric === "load" || metric === "estimatedOneRepMax"
    ? formatNumber(value)
    : String(Math.round(value));
}

export function formatMetricValue(value: number, metric: ProgressionMetric): string {
  const unit = metricUnit(metric);
  const amount = formatMetricAmount(value, metric);
  return unit ? `${amount} ${unit}` : amount;
}

/** Absolute change with an explicit sign, e.g. "+2.5 kg" or "−3 reps". */
export function formatChange(change: ProgressChange, metric: ProgressionMetric): string {
  const sign = trendOf(change) === "up" ? "+" : trendOf(change) === "down" ? "−" : "";
  return `${sign}${formatMetricValue(Math.abs(change.absolute), metric)}`;
}

export function formatPercent(percent: number): string {
  const magnitude =
    Math.abs(percent) < 1 ? Math.round(Math.abs(percent) * 10) / 10 : Math.round(Math.abs(percent));
  const sign = magnitude === 0 ? "" : percent > 0 ? "+" : "−";
  return `${sign}${magnitude}%`;
}

export function trendOf(change: ProgressChange): Trend {
  // The estimated 1RM carries float noise, so tiny differences count as no change.
  if (Math.abs(change.absolute) < 0.05) return "flat";
  return change.absolute > 0 ? "up" : "down";
}

/** How much of the set was done: "8" reps, or "01:30" when timed. */
function setAmount(set: ExerciseSetLog): string {
  return set.durationSeconds !== undefined ? formatDuration(set.durationSeconds) : String(set.reps);
}

/** "62.5 kg × 8", "12 reps" when no load was used, or "01:30" when timed. */
export function formatSet(set: ExerciseSetLog): string {
  if (set.loadKg > 0) return `${formatNumber(set.loadKg)} kg × ${setAmount(set)}`;
  return set.durationSeconds !== undefined ? setAmount(set) : `${set.reps} reps`;
}

/** Every set of a session, compact: "60×10 · 60×8 · 55×8", or "00:45 · 01:00" when timed. */
export function formatSets(sets: readonly ExerciseSetLog[]): string {
  if (sets.every((set) => set.loadKg === 0)) {
    const amounts = sets.map(setAmount).join(" · ");
    return sets.some((set) => set.durationSeconds !== undefined) ? amounts : `${amounts} reps`;
  }
  return sets.map((set) => `${formatNumber(set.loadKg)}×${setAmount(set)}`).join(" · ");
}

export function formatShortDate(date: DateKey): string {
  return format(fromDateKey(date), "dd/MM", { locale: ptBR });
}

/** "Qua, 12/09" */
export function formatSessionDate(date: DateKey): string {
  const text = format(fromDateKey(date), "EEE, dd/MM", { locale: ptBR });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "hoje", "ontem", "há 3 dias" — falls back to the date after a week. */
export function formatRelativeDay(date: DateKey, today: Date = new Date()): string {
  const days = differenceInCalendarDays(today, fromDateKey(date));
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 7) return `há ${days} dias`;
  return formatShortDate(date);
}

/** Case- and accent-insensitive search on the exercise name. */
export function matchesExerciseName(name: string, query: string): boolean {
  const normalizedQuery = normalizeText(query);
  return !normalizedQuery || normalizeText(name).includes(normalizedQuery);
}
