import { BodyMeasurement, MeasurementType } from "@domain/entities/BodyMeasurement";
import { BodyMeasurementRepository } from "@domain/repositories/BodyMeasurementRepository";
import { generateId } from "@shared/id";
import { todayKey } from "@shared/date-utils";
import {
  RegisterMeasurementsInput,
  registerMeasurementsSchema,
} from "../dtos/RegisterMeasurements.dto";

export class RegisterMeasurementsUseCase {
  constructor(private readonly bodyMeasurementRepository: BodyMeasurementRepository) {}

  async execute(rawInput: RegisterMeasurementsInput): Promise<BodyMeasurement[]> {
    const input = registerMeasurementsSchema.parse(rawInput);
    const date = input.date ?? todayKey();

    const entries: BodyMeasurement[] = [];
    for (const [type, valueCm] of Object.entries(input.values)) {
      if (valueCm === undefined) continue;
      const result = BodyMeasurement.create({
        id: generateId(),
        profileId: input.profileId,
        date,
        type: type as MeasurementType,
        valueCm,
      });
      if (!result.ok) throw result.error;
      entries.push(result.value);
    }

    if (entries.length === 0) return [];

    await this.bodyMeasurementRepository.saveMany(entries);
    return entries;
  }
}
