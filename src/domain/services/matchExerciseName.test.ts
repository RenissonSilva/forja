import { ExerciseInfoSummary } from "@domain/repositories/ExerciseInfoRepository";
import { matchExerciseName } from "./matchExerciseName";

const candidates: ExerciseInfoSummary[] = [
  { externalId: "1", name: "barbell bench press", bodyPart: "chest", targetMuscle: "pectorals" },
  { externalId: "2", name: "barbell squat", bodyPart: "upper legs", targetMuscle: "quads" },
  { externalId: "3", name: "hammer curl", bodyPart: "upper arms", targetMuscle: "biceps" },
  { externalId: "4", name: "seated cable row", bodyPart: "back", targetMuscle: "lats" },
];

describe("matchExerciseName", () => {
  it("matches a PT-BR dictionary term against the English candidate", () => {
    const result = matchExerciseName("Supino", candidates);
    expect(result?.externalId).toBe("1");
  });

  it("matches a multi-word PT-BR name via dictionary substitution", () => {
    const result = matchExerciseName("Rosca martelo", candidates);
    expect(result?.externalId).toBe("3");
  });

  it("matches case/accents-insensitively", () => {
    const result = matchExerciseName("AGACHAMENTO", candidates);
    expect(result?.externalId).toBe("2");
  });

  it("returns null for an empty query", () => {
    expect(matchExerciseName("", candidates)).toBeNull();
  });

  it("returns null when there is no reasonable match (prefers hiding the icon over a wrong match)", () => {
    const result = matchExerciseName("Exercício totalmente inventado xyz", candidates);
    expect(result).toBeNull();
  });

  it("returns null when the candidate list is empty", () => {
    expect(matchExerciseName("Supino", [])).toBeNull();
  });
});
