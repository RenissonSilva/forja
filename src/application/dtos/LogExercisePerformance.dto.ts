import { z } from "zod";

export const logExercisePerformanceSchema = z.object({
  profileId: z.string().min(1),
  date: z.string().optional(),
  entries: z.array(
    z.object({
      exerciseId: z.string().min(1),
      sets: z.array(
        z.object({
          reps: z.coerce.number().int(),
          loadKg: z.coerce.number(),
          durationSeconds: z.coerce.number().int().optional(),
        }),
      ),
    }),
  ),
});

export type LogExercisePerformanceInput = z.infer<typeof logExercisePerformanceSchema>;
