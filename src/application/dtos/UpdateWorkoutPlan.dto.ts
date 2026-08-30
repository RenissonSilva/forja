import { z } from "zod";

export const updateWorkoutPlanSchema = z.object({
  workoutPlanId: z.string().min(1),
  name: z.string().min(1).max(60),
});

export type UpdateWorkoutPlanInput = z.infer<typeof updateWorkoutPlanSchema>;
