import { Profile } from "@domain/entities/Profile";
import { WeightEntry } from "@domain/entities/WeightEntry";
import { ProfileRepository } from "@domain/repositories/ProfileRepository";
import { WeightEntryRepository } from "@domain/repositories/WeightEntryRepository";
import { generateId } from "@shared/id";
import { toDateKey } from "@shared/date-utils";
import { CreateProfileInput, createProfileSchema } from "../dtos/CreateProfile.dto";

export class CreateProfileUseCase {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly weightEntryRepository: WeightEntryRepository,
  ) {}

  async execute(rawInput: CreateProfileInput): Promise<Profile> {
    const input = createProfileSchema.parse(rawInput);
    const now = new Date();

    const profileResult = Profile.create({
      id: generateId(),
      name: input.name,
      avatarUri: input.avatarUri ?? null,
      heightCm: input.heightCm,
      weeklyGoalDays: input.weeklyGoalDays,
      remindersEnabled: input.remindersEnabled,
      now,
    });
    if (!profileResult.ok) throw profileResult.error;
    const profile = profileResult.value;

    const weightEntryResult = WeightEntry.create({
      id: generateId(),
      profileId: profile.id,
      date: toDateKey(now),
      weightKg: input.weightKg,
    });
    if (!weightEntryResult.ok) throw weightEntryResult.error;

    await this.profileRepository.save(profile);
    await this.weightEntryRepository.save(weightEntryResult.value);

    return profile;
  }
}
