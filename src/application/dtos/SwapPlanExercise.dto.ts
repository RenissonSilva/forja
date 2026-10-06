import { z } from "zod";

export const swapPlanExerciseSchema = z.object({
  workoutPlanId: z.string().min(1),
  workoutPlanExerciseId: z.string().min(1),
  /** The exercise that takes the place of the current one. */
  exerciseId: z.string().min(1),
  sets: z
    .array(
      z.object({
        // Timed sets ignore reps, so the entity checks reps or duration.
        reps: z.coerce.number().int().min(0).max(100),
        loadKg: z.coerce.number().min(0).max(500),
        durationSeconds: z.coerce.number().int().optional(),
      }),
    )
    .min(1)
    .max(20),
});

export type SwapPlanExerciseInput = z.infer<typeof swapPlanExerciseSchema>;
