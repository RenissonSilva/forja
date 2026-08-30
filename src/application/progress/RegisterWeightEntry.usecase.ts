import { WeightEntry } from "@domain/entities/WeightEntry";
import { WeightEntryRepository } from "@domain/repositories/WeightEntryRepository";
import { generateId } from "@shared/id";
import { todayKey } from "@shared/date-utils";
import {
  RegisterWeightEntryInput,
  registerWeightEntrySchema,
} from "../dtos/RegisterWeightEntry.dto";

export class RegisterWeightEntryUseCase {
  constructor(private readonly weightEntryRepository: WeightEntryRepository) {}

  async execute(rawInput: RegisterWeightEntryInput): Promise<WeightEntry> {
    const input = registerWeightEntrySchema.parse(rawInput);

    const result = WeightEntry.create({
      id: generateId(),
      profileId: input.profileId,
      date: input.date ?? todayKey(),
      weightKg: input.weightKg,
    });
    if (!result.ok) throw result.error;

    await this.weightEntryRepository.save(result.value);
    return result.value;
  }
}
