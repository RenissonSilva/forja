import { Exercise, MuscleGroup } from "@domain/entities/Exercise";
import { InMemoryExerciseLogRepository } from "../testing/InMemoryExerciseLogRepository";
import { InMemoryExerciseRepository } from "../testing/InMemoryExerciseRepository";
import { LogExercisePerformanceUseCase } from "./LogExercisePerformance.usecase";
import { GetExerciseProgressUseCase } from "./GetExerciseProgress.usecase";

async function seedExercise(
  repository: InMemoryExerciseRepository,
  id: string,
  name: string,
  muscleGroup: MuscleGroup,
) {
  const result = Exercise.create({ id, name, muscleGroup, isCustom: false });
  if (!result.ok) throw new Error("fixture should be valid");
  await repository.save(result.value);
}

async function setup() {
  const exerciseRepository = new InMemoryExerciseRepository();
  const exerciseLogRepository = new InMemoryExerciseLogRepository();
  await seedExercise(exerciseRepository, "supino-reto", "Supino reto", "peito");
  await seedExercise(exerciseRepository, "agachamento", "Agachamento", "perna");
  await seedExercise(exerciseRepository, "remada", "Remada curvada", "costas");

  const log = new LogExercisePerformanceUseCase(exerciseLogRepository);
  const useCase = new GetExerciseProgressUseCase(exerciseLogRepository, exerciseRepository);
  return { log, useCase };
}

describe("GetExerciseProgressUseCase", () => {
  it("lists the most recently trained exercises first, by name within the same day", async () => {
    const { log, useCase } = await setup();
    await log.execute({
      profileId: "profile-1",
      date: "2026-09-01",
      entries: [{ exerciseId: "agachamento", sets: [{ reps: 10, loadKg: 80 }] }],
    });
    await log.execute({
      profileId: "profile-1",
      date: "2026-09-03",
      entries: [
        { exerciseId: "supino-reto", sets: [{ reps: 8, loadKg: 60 }] },
        { exerciseId: "remada", sets: [{ reps: 10, loadKg: 50 }] },
      ],
    });

    const items = await useCase.execute({ profileId: "profile-1" });

    expect(items.map((item) => item.exercise?.name)).toEqual([
      "Remada curvada",
      "Supino reto",
      "Agachamento",
    ]);
  });

  it("attaches each exercise's sessions and records", async () => {
    const { log, useCase } = await setup();
    for (const [date, loadKg] of [
      ["2026-09-01", 60],
      ["2026-09-08", 65],
    ] as const) {
      await log.execute({
        profileId: "profile-1",
        date,
        entries: [{ exerciseId: "supino-reto", sets: [{ reps: 8, loadKg }] }],
      });
    }

    const [item] = await useCase.execute({ profileId: "profile-1" });

    expect(item?.sessions.map((session) => session.date)).toEqual(["2026-09-01", "2026-09-08"]);
    expect(item?.records[0]).toMatchObject({ metric: "load", value: 65 });
  });

  it("keeps an exercise that is no longer in the catalog", async () => {
    const { log, useCase } = await setup();
    await log.execute({
      profileId: "profile-1",
      date: "2026-09-01",
      entries: [{ exerciseId: "apagado", sets: [{ reps: 8, loadKg: 20 }] }],
    });

    const [item] = await useCase.execute({ profileId: "profile-1" });

    expect(item?.exerciseId).toBe("apagado");
    expect(item?.exercise).toBeUndefined();
  });

  it("returns nothing for a profile without logs", async () => {
    const { useCase } = await setup();

    expect(await useCase.execute({ profileId: "profile-1" })).toEqual([]);
  });
});
