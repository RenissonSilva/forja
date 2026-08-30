import { z } from "zod";

export const createWorkoutPlanSchema = z.object({
  profileId: z.string().min(1),
  name: z.string().min(1).max(60),
});

export type CreateWorkoutPlanInput = z.infer<typeof createWorkoutPlanSchema>;
