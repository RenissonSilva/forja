import { ProfileNotFoundError } from "@domain/errors/ProfileErrors";
import { ProfileRepository } from "@domain/repositories/ProfileRepository";
import { WeightEntryRepository } from "@domain/repositories/WeightEntryRepository";
import { Bmi, BmiClassification } from "@domain/value-objects/Bmi";
import { Height } from "@domain/value-objects/Height";
import { Weight } from "@domain/value-objects/Weight";
import { DateKey } from "@shared/date-utils";

export interface BmiHistoryPoint {
  date: DateKey;
  weightKg: number;
  bmi: number;
  classification: BmiClassification;
}

export class GetBmiHistoryUseCase {
  constructor(
    private readonly weightEntryRepository: WeightEntryRepository,
    private readonly profileRepository: ProfileRepository,
  ) {}

  async execute(input: { profileId: string }): Promise<BmiHistoryPoint[]> {
    const profile = await this.profileRepository.findCurrent();
    if (!profile) throw new ProfileNotFoundError();

    const heightResult = Height.create(profile.heightCm);
    if (!heightResult.ok) throw heightResult.error;

    const entries = await this.weightEntryRepository.findAllByProfile(input.profileId);

    return entries.map((entry) => {
      const weightResult = Weight.create(entry.weightKg);
      if (!weightResult.ok) throw weightResult.error;

      const bmi = Bmi.calculate(weightResult.value, heightResult.value);
      return {
        date: entry.date,
        weightKg: entry.weightKg,
        bmi: bmi.value,
        classification: bmi.classification,
      };
    });
  }
}
