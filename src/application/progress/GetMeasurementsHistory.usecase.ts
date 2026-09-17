import { BodyMeasurement } from "@domain/entities/BodyMeasurement";
import { BodyMeasurementRepository } from "@domain/repositories/BodyMeasurementRepository";

export class GetMeasurementsHistoryUseCase {
  constructor(private readonly bodyMeasurementRepository: BodyMeasurementRepository) {}

  async execute(input: { profileId: string }): Promise<BodyMeasurement[]> {
    return this.bodyMeasurementRepository.findAllByProfile(input.profileId);
  }
}
