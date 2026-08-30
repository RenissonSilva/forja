import { z } from "zod";

export const registerWeightEntrySchema = z.object({
  profileId: z.string().min(1),
  weightKg: z.coerce.number(),
  date: z.string().optional(),
});

export type RegisterWeightEntryInput = z.infer<typeof registerWeightEntrySchema>;
