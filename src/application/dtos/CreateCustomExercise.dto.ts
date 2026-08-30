import { z } from "zod";
import { MUSCLE_GROUPS } from "@domain/entities/Exercise";

export const createCustomExerciseSchema = z.object({
  name: z.string().min(1).max(60),
  muscleGroup: z.enum(MUSCLE_GROUPS),
});

export type CreateCustomExerciseInput = z.infer<typeof createCustomExerciseSchema>;
