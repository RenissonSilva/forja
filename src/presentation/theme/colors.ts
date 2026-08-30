import { BmiClassification } from "@domain/value-objects/Bmi";
import { WorkoutPlanColorTag } from "@domain/entities/WorkoutPlan";

/** FORJA is a dark-only design (see the Claude Design reference screens). */
export const colors = {
  background: "#0B0B0D",

  surface: "#131317",
  surfaceRaised: "#15151A",
  surfaceSunken: "#17171C",
  surfaceDeep: "#1D1D24",
  control: "#22222A",
  controlAlt: "#2A2A33",
  elevated: "#1F1F26",

  border: "rgba(255,255,255,0.07)",
  borderSubtle: "rgba(255,255,255,0.06)",
  borderStrong: "rgba(255,255,255,0.12)",

  textPrimary: "#F5F4F2",
  textSecondary: "rgba(245,244,242,0.58)",
  textMuted: "rgba(245,244,242,0.45)",
  textFaint: "rgba(245,244,242,0.36)",
  textGhost: "rgba(245,244,242,0.14)",

  primary: "#FF6A1A",
  primaryHover: "#FF8038",
  primaryMuted: "rgba(255,106,26,0.14)",
  primaryMutedStrong: "rgba(255,106,26,0.18)",
  primaryBorder: "rgba(255,106,26,0.45)",
  onPrimary: "#150A02",

  success: "#5FAE7A",
  successMuted: "rgba(95,174,122,0.14)",
  successBorder: "rgba(95,174,122,0.4)",
  danger: "#B5484B",
} as const;

export const workoutPlanColors: Record<WorkoutPlanColorTag, string> = {
  orange: "#FF6A1A",
  blue: "#4A6FA5",
  gold: "#8A5A2A",
  green: "#4F7A5A",
};

export const bmiClassificationColors: Record<BmiClassification, string> = {
  abaixo: "#3A4A6B",
  saudavel: "#FF6A1A",
  sobrepeso: "#8A5A2A",
  obesidade: "#5A3030",
};

export const bmiClassificationLabels: Record<BmiClassification, string> = {
  abaixo: "abaixo",
  saudavel: "saudável",
  sobrepeso: "sobrepeso",
  obesidade: "obesidade",
};
