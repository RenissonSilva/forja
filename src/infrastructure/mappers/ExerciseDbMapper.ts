import {
  ExerciseInfoDetailsRaw,
  ExerciseInfoSummary,
} from "@domain/repositories/ExerciseInfoRepository";
import { ExerciseDbApiItem } from "@infrastructure/http/ExerciseDbHttpClient";

export const ExerciseDbMapper = {
  toSummary(item: ExerciseDbApiItem): ExerciseInfoSummary {
    return {
      externalId: item.exerciseId,
      name: item.name,
      bodyPart: item.bodyParts?.[0] ?? "",
      targetMuscle: item.targetMuscles?.[0] ?? "",
    };
  },

  toDetailsRaw(item: ExerciseDbApiItem): ExerciseInfoDetailsRaw {
    return {
      externalId: item.exerciseId,
      name: item.name,
      bodyPart: item.bodyParts?.[0] ?? "",
      targetMuscle: item.targetMuscles?.[0] ?? "",
      secondaryMuscles: item.secondaryMuscles ?? [],
      equipment: item.equipments?.[0] ?? "",
      gifUrl: item.gifUrl,
      instructions: item.instructions ?? [],
    };
  },
};
