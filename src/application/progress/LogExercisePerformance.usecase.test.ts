import { InMemoryExerciseLogRepository } from "../testing/InMemoryExerciseLogRepository";
import { LogExercisePerformanceUseCase } from "./LogExercisePerformance.usecase";

const threeSets = (reps: number, loadKg: number) => [
  { reps, loadKg },
  { reps, loadKg },
  { reps, loadKg },
];

describe("LogExercisePerformanceUseCase", () => {
  it("logs one entry per exercise", async () => {
    const repository = new InMemoryExerciseLogRepository();
    const useCase = new LogExercisePerformanceUseCase(repository);

    await useCase.execute({
      profileId: "profile-1",
      date: "2026-08-20",
      entries: [
        { exerciseId: "supino-reto", sets: threeSets(10, 40) },
        { exerciseId: "agachamento", sets: threeSets(8, 60) },
      ],
    });

    const entries = await repository.findAllByProfile("profile-1");
    expect(entries).toHaveLength(2);
    expect(entries.map((entry) => entry.exerciseId).sort()).toEqual(["agachamento", "supino-reto"]);
  });

  it("keeps each set's reps and load individually", async () => {
    const repository = new InMemoryExerciseLogRepository();
    const useCase = new LogExercisePerformanceUseCase(repository);

    await useCase.execute({
      profileId: "profile-1",
      date: "2026-08-20",
      entries: [
        {
          exerciseId: "supino-reto",
          sets: [
            { reps: 12, loadKg: 40 },
            { reps: 10, loadKg: 45 },
            { reps: 8, loadKg: 50 },
          ],
        },
      ],
    });

    const [entry] = await repository.findAllByProfile("profile-1");
    expect(entry?.setDetails).toEqual([
      { reps: 12, loadKg: 40 },
      { reps: 10, loadKg: 45 },
      { reps: 8, loadKg: 50 },
    ]);
    expect(entry?.sets).toBe(3);
    expect(entry?.loadKg).toBe(50);
    expect(entry?.reps).toBe(8);
    expect(entry?.volumeKg).toBe(12 * 40 + 10 * 45 + 8 * 50);
  });

  it("overwrites an existing entry for the same day and exercise instead of duplicating it", async () => {
    const repository = new InMemoryExerciseLogRepository();
    const useCase = new LogExercisePerformanceUseCase(repository);

    await useCase.execute({
      profileId: "profile-1",
      date: "2026-08-20",
      entries: [{ exerciseId: "supino-reto", sets: threeSets(10, 40) }],
    });
    await useCase.execute({
      profileId: "profile-1",
      date: "2026-08-20",
      entries: [{ exerciseId: "supino-reto", sets: threeSets(10, 42.5) }],
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

  it("rejects an entry without sets", async () => {
    const repository = new InMemoryExerciseLogRepository();
    const useCase = new LogExercisePerformanceUseCase(repository);

    await expect(
      useCase.execute({
        profileId: "profile-1",
        entries: [{ exerciseId: "supino-reto", sets: [] }],
      }),
    ).rejects.toThrow();
  });

  it("rejects an out-of-range set value", async () => {
    const repository = new InMemoryExerciseLogRepository();
    const useCase = new LogExercisePerformanceUseCase(repository);

    await expect(
      useCase.execute({
        profileId: "profile-1",
        entries: [
          {
            exerciseId: "supino-reto",
            sets: [
              { reps: 10, loadKg: 40 },
              { reps: 0, loadKg: 40 },
            ],
          },
        ],
      }),
    ).rejects.toThrow();
  });
});
