import { z } from "zod";
import { MEASUREMENT_TYPES } from "@domain/entities/BodyMeasurement";

export const registerMeasurementsSchema = z.object({
  profileId: z.string().min(1),
  date: z.string().optional(),
  values: z
    .object(Object.fromEntries(MEASUREMENT_TYPES.map((type) => [type, z.coerce.number().optional()])))
    .partial(),
});

export type RegisterMeasurementsInput = z.infer<typeof registerMeasurementsSchema>;
