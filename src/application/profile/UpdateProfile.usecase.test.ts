import { Profile } from "@domain/entities/Profile";
import { InMemoryProfileRepository } from "../testing/InMemoryProfileRepository";
import { UpdateProfileUseCase } from "./UpdateProfile.usecase";

async function seedProfile(repository: InMemoryProfileRepository) {
  const result = Profile.create({
    id: "profile-1",
    name: "Rafael Lima",
    avatarUri: null,
    heightCm: 178,
    weeklyGoalDays: 4,
    remindersEnabled: true,
  });
  if (!result.ok) throw new Error("fixture should be valid");
  await repository.save(result.value);
  return result.value;
}

describe("UpdateProfileUseCase", () => {
  it("updates only the provided fields", async () => {
    const repository = new InMemoryProfileRepository();
    await seedProfile(repository);
    const useCase = new UpdateProfileUseCase(repository);

    const updated = await useCase.execute({ weeklyGoalDays: 5 });

    expect(updated.weeklyGoalDays).toBe(5);
    expect(updated.name).toBe("Rafael Lima");
  });

  it("throws when there is no current profile", async () => {
    const repository = new InMemoryProfileRepository();
    const useCase = new UpdateProfileUseCase(repository);

    await expect(useCase.execute({ weeklyGoalDays: 5 })).rejects.toThrow();
  });
});
