import { z } from "zod";

export const createProfileSchema = z.object({
  name: z.string().min(1).max(60),
  avatarUri: z.string().nullable().optional(),
  heightCm: z.coerce.number(),
  weightKg: z.coerce.number(),
  weeklyGoalDays: z.coerce.number().int().min(1).max(7),
  remindersEnabled: z.boolean(),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
