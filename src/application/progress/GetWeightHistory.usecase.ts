import { WeightEntry } from "@domain/entities/WeightEntry";
import { WeightEntryRepository } from "@domain/repositories/WeightEntryRepository";

export class GetWeightHistoryUseCase {
  constructor(private readonly weightEntryRepository: WeightEntryRepository) {}

  async execute(input: { profileId: string }): Promise<WeightEntry[]> {
    return this.weightEntryRepository.findAllByProfile(input.profileId);
  }
}
