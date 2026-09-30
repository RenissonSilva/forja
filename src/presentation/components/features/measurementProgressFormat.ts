import { MEASUREMENT_TYPES, MeasurementType } from "@domain/entities/BodyMeasurement";
import { ProgressChange } from "@domain/services/exerciseProgression";
import { ChangeOutcome } from "@domain/services/measurementProgression";
import { formatNumber, trendColors, trendOf } from "./exerciseProgressFormat";

/** Green when the measure moved toward its goal, red when away from it. */
export const outcomeColors: Record<ChangeOutcome, { text: string; background: string }> = {
  improved: trendColors.up,
  worsened: trendColors.down,
  unchanged: trendColors.flat,
};

export function formatCm(value: number): string {
  return `${formatNumber(value)} cm`;
}

/** Absolute change with an explicit sign, e.g. "+0.5 cm" or "−3 cm". */
export function formatCmChange(change: ProgressChange): string {
  const trend = trendOf(change);
  const sign = trend === "up" ? "+" : trend === "down" ? "−" : "";
  return `${sign}${formatCm(Math.abs(change.absolute))}`;
}

/** Narrows a route param to a measurement type; null when it names none. */
export function parseMeasurementType(value: string | undefined): MeasurementType | null {
  return MEASUREMENT_TYPES.find((type) => type === value) ?? null;
}
