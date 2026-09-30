import { BodyMeasurement, MeasurementType } from "../entities/BodyMeasurement";
import { ProgressChange } from "./exerciseProgression";

export type MeasurementGoal = "decrease" | "increase";

/** Waist-like measures are expected to shrink; muscle ones to grow. */
export const MEASUREMENT_GOALS: Record<MeasurementType, MeasurementGoal> = {
  cintura: "decrease",
  abdomen: "decrease",
  quadril: "decrease",
  biceps: "increase",
  coxas: "increase",
  peitoral: "increase",
  panturrilhas: "increase",
  antebraco: "increase",
};

export type ChangeOutcome = "improved" | "worsened" | "unchanged";

/** Entries per type, oldest first; types never registered are left out. */
export function groupMeasurementsByType(
  entries: readonly BodyMeasurement[],
): Partial<Record<MeasurementType, BodyMeasurement[]>> {
  const result: Partial<Record<MeasurementType, BodyMeasurement[]>> = {};
  for (const entry of entries) {
    const list = result[entry.type] ?? [];
    list.push(entry);
    result[entry.type] = list;
  }
  for (const list of Object.values(result)) list.sort((a, b) => a.date.localeCompare(b.date));
  return result;
}

/** Change from the first to the last of the given entries; null with fewer than two. */
export function measurementChange(entries: readonly BodyMeasurement[]): ProgressChange | null {
  const first = entries[0];
  const last = entries[entries.length - 1];
  if (!first || !last || first === last) return null;

  const absolute = last.valueCm - first.valueCm;
  return { absolute, percent: (absolute / first.valueCm) * 100 };
}

export function changeOutcome(type: MeasurementType, change: ProgressChange): ChangeOutcome {
  // Values carry one decimal, so anything below half a millimetre is float noise.
  if (Math.abs(change.absolute) < 0.05) return "unchanged";
  const grew = change.absolute > 0;
  return grew === (MEASUREMENT_GOALS[type] === "increase") ? "improved" : "worsened";
}
