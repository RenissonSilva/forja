import { z } from "zod";

export const addExerciseToPlanSchema = z.object({
  workoutPlanId: z.string().min(1),
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
  seatHeight: z.coerce.number().nullable().optional(),
  seatDistance: z.coerce.number().nullable().optional(),
  seatIncline: z.coerce.number().nullable().optional(),
  seatLock: z.coerce.number().nullable().optional(),
});

export type AddExerciseToPlanInput = z.infer<typeof addExerciseToPlanSchema>;
