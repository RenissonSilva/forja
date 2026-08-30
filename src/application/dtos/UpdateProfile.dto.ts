import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  avatarUri: z.string().nullable().optional(),
  heightCm: z.coerce.number().optional(),
  weeklyGoalDays: z.coerce.number().int().min(1).max(7).optional(),
  remindersEnabled: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
