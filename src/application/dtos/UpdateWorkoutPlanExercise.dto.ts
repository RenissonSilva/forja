import { z } from "zod";

export const updateWorkoutPlanExerciseSchema = z.object({
  workoutPlanId: z.string().min(1),
  workoutPlanExerciseId: z.string().min(1),
  sets: z.coerce.number().int().min(1).max(20).optional(),
  reps: z.coerce.number().int().min(1).max(100).optional(),
  loadKg: z.coerce.number().min(0).max(500).optional(),
  seatAdjustment: z.string().nullable().optional(),
});

export type UpdateWorkoutPlanExerciseInput = z.infer<typeof updateWorkoutPlanExerciseSchema>;
