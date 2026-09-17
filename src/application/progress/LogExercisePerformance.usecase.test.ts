import { InMemoryExerciseLogRepository } from "../testing/InMemoryExerciseLogRepository";
import { LogExercisePerformanceUseCase } from "./LogExercisePerformance.usecase";

describe("LogExercisePerformanceUseCase", () => {
  it("logs one entry per exercise", async () => {
    const repository = new InMemoryExerciseLogRepository();
    const useCase = new LogExercisePerformanceUseCase(repository);

    await useCase.execute({
      profileId: "profile-1",
      date: "2026-08-20",
      entries: [
        { exerciseId: "supino-reto", sets: 3, reps: 10, loadKg: 40 },
        { exerciseId: "agachamento", sets: 4, reps: 8, loadKg: 60 },
      ],
    });

    const entries = await repository.findAllByProfile("profile-1");
    expect(entries).toHaveLength(2);
    expect(entries.map((entry) => entry.exerciseId).sort()).toEqual([
      "agachamento",
      "supino-reto",
    ]);
  });

  it("overwrites an existing entry for the same day and exercise instead of duplicating it", async () => {
    const repository = new InMemoryExerciseLogRepository();
    const useCase = new LogExercisePerformanceUseCase(repository);

    await useCase.execute({
      profileId: "profile-1",
      date: "2026-08-20",
      entries: [{ exerciseId: "supino-reto", sets: 3, reps: 10, loadKg: 40 }],
    });
    await useCase.execute({
      profileId: "profile-1",
      date: "2026-08-20",
      entries: [{ exerciseId: "supino-reto", sets: 3, reps: 10, loadKg: 42.5 }],
    });

    const entries = await repository.findAllByProfile("profile-1");
    expect(entries).toHaveLength(1);
    expect(entries[0]?.loadKg).toBe(42.5);
  });

  it("does nothing when no entries are provided", async () => {
    const repository = new InMemoryExerciseLogRepository();
    const useCase = new LogExercisePerformanceUseCase(repository);

    const result = await useCase.execute({ profileId: "profile-1", entries: [] });

    expect(result).toEqual([]);
    expect(await repository.findAllByProfile("profile-1")).toHaveLength(0);
  });

  it("rejects an out-of-range value", async () => {
    const repository = new InMemoryExerciseLogRepository();
    const useCase = new LogExercisePerformanceUseCase(repository);

    await expect(
      useCase.execute({
        profileId: "profile-1",
        entries: [{ exerciseId: "supino-reto", sets: 0, reps: 10, loadKg: 40 }],
      }),
    ).rejects.toThrow();
  });
});
