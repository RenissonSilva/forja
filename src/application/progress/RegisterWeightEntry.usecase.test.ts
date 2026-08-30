import { InMemoryWeightEntryRepository } from "../testing/InMemoryWeightEntryRepository";
import { RegisterWeightEntryUseCase } from "./RegisterWeightEntry.usecase";

describe("RegisterWeightEntryUseCase", () => {
  it("registers a weight entry for an explicit date", async () => {
    const repository = new InMemoryWeightEntryRepository();
    const useCase = new RegisterWeightEntryUseCase(repository);

    await useCase.execute({ profileId: "profile-1", weightKg: 75.5, date: "2026-08-20" });

    const entries = await repository.findAllByProfile("profile-1");
    expect(entries).toHaveLength(1);
    expect(entries[0]?.date).toBe("2026-08-20");
  });

  it("overwrites an existing entry for the same day instead of duplicating it", async () => {
    const repository = new InMemoryWeightEntryRepository();
    const useCase = new RegisterWeightEntryUseCase(repository);

    await useCase.execute({ profileId: "profile-1", weightKg: 75.5, date: "2026-08-20" });
    await useCase.execute({ profileId: "profile-1", weightKg: 75.8, date: "2026-08-20" });

    const entries = await repository.findAllByProfile("profile-1");
    expect(entries).toHaveLength(1);
    expect(entries[0]?.weightKg).toBe(75.8);
  });

  it("rejects an out-of-range weight", async () => {
    const repository = new InMemoryWeightEntryRepository();
    const useCase = new RegisterWeightEntryUseCase(repository);

    await expect(
      useCase.execute({ profileId: "profile-1", weightKg: 1, date: "2026-08-20" }),
    ).rejects.toThrow();
  });
});
