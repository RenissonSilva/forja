import { z } from "zod";

export const addExerciseToPlanSchema = z.object({
  workoutPlanId: z.string().min(1),
  exerciseId: z.string().min(1),
  sets: z.coerce.number().int().min(1).max(20),
  reps: z.coerce.number().int().min(1).max(100),
  loadKg: z.coerce.number().min(0).max(500),
  seatHeight: z.coerce.number().nullable().optional(),
  seatDistance: z.coerce.number().nullable().optional(),
  seatIncline: z.coerce.number().nullable().optional(),
  seatLock: z.coerce.number().nullable().optional(),
});

export type AddExerciseToPlanInput = z.infer<typeof addExerciseToPlanSchema>;
