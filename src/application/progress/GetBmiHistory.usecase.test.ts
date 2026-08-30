import { Profile } from "@domain/entities/Profile";
import { WeightEntry } from "@domain/entities/WeightEntry";
import { InMemoryProfileRepository } from "../testing/InMemoryProfileRepository";
import { InMemoryWeightEntryRepository } from "../testing/InMemoryWeightEntryRepository";
import { GetBmiHistoryUseCase } from "./GetBmiHistory.usecase";

async function seedProfile(repository: InMemoryProfileRepository, heightCm: number) {
  const result = Profile.create({
    id: "profile-1",
    name: "Rafael Lima",
    avatarUri: null,
    heightCm,
    weeklyGoalDays: 4,
    remindersEnabled: true,
  });
  if (!result.ok) throw new Error("fixture should be valid");
  await repository.save(result.value);
}

describe("GetBmiHistoryUseCase", () => {
  it("derives BMI for each weight entry using the profile's current height", async () => {
    const profileRepository = new InMemoryProfileRepository();
    const weightEntryRepository = new InMemoryWeightEntryRepository();
    await seedProfile(profileRepository, 178);

    for (const [date, weightKg] of [
      ["2026-03-01", 80.9],
      ["2026-08-30", 76.4],
    ] as const) {
      const entry = WeightEntry.create({ id: date, profileId: "profile-1", date, weightKg });
      if (!entry.ok) throw new Error("fixture should be valid");
      await weightEntryRepository.save(entry.value);
    }

    const useCase = new GetBmiHistoryUseCase(weightEntryRepository, profileRepository);
    const points = await useCase.execute({ profileId: "profile-1" });

    expect(points).toHaveLength(2);
    expect(points[0]?.date).toBe("2026-03-01");
    expect(points[1]?.bmi).toBeCloseTo(24.1, 1);
    expect(points[1]?.classification).toBe("saudavel");
  });

  it("throws when there is no profile yet", async () => {
    const profileRepository = new InMemoryProfileRepository();
    const weightEntryRepository = new InMemoryWeightEntryRepository();
    const useCase = new GetBmiHistoryUseCase(weightEntryRepository, profileRepository);

    await expect(useCase.execute({ profileId: "profile-1" })).rejects.toThrow();
  });
});
