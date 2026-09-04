import { InMemoryProfileRepository } from "../testing/InMemoryProfileRepository";
import { InMemoryWeightEntryRepository } from "../testing/InMemoryWeightEntryRepository";
import { CreateProfileUseCase } from "./CreateProfile.usecase";

function makeUseCase() {
  const profileRepository = new InMemoryProfileRepository();
  const weightEntryRepository = new InMemoryWeightEntryRepository();
  const useCase = new CreateProfileUseCase(profileRepository, weightEntryRepository);
  return { useCase, profileRepository, weightEntryRepository };
}

const validInput = {
  name: "Rafael Lima",
  avatarUri: null,
  heightCm: 178,
  weightKg: 76.4,
  weeklyGoalDays: 4,
  remindersEnabled: true,
};

const profileId = "auth-user-1";

describe("CreateProfileUseCase", () => {
  it("persists both the profile and an initial weight entry", async () => {
    const { useCase, profileRepository, weightEntryRepository } = makeUseCase();

    const profile = await useCase.execute(validInput, profileId);

    expect(profile.id).toBe(profileId);
    expect(await profileRepository.findCurrent()).toBe(profile);
    const entries = await weightEntryRepository.findAllByProfile(profile.id);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.weightKg).toBe(76.4);
  });

  it("does not persist anything when the height is invalid", async () => {
    const { useCase, profileRepository, weightEntryRepository } = makeUseCase();

    await expect(useCase.execute({ ...validInput, heightCm: 10 }, profileId)).rejects.toThrow();

    expect(await profileRepository.findCurrent()).toBeNull();
    expect(await weightEntryRepository.findAllByProfile("any")).toHaveLength(0);
  });

  it("rejects input that fails DTO validation before touching the domain", async () => {
    const { useCase } = makeUseCase();

    await expect(
      useCase.execute({ ...validInput, weeklyGoalDays: 9 }, profileId),
    ).rejects.toThrow();
  });
});
