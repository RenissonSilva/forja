import { DateKey, monthsAgoKey } from "@shared/date-utils";

export type ProgressPeriod = "1m" | "3m" | "all";

export const PROGRESS_PERIOD_OPTIONS = [
  { value: "1m", label: "1 mês" },
  { value: "3m", label: "3 meses" },
  { value: "all", label: "Tudo" },
] as const;

const PERIOD_MONTHS: Record<Exclude<ProgressPeriod, "all">, number> = { "1m": 1, "3m": 3 };

/** Entries dated inside the period, keeping their order. */
export function filterByPeriod<T extends { date: DateKey }>(
  entries: readonly T[],
  period: ProgressPeriod,
): readonly T[] {
  if (period === "all") return entries;
  const since = monthsAgoKey(PERIOD_MONTHS[period]);
  return entries.filter((entry) => entry.date >= since);
}
