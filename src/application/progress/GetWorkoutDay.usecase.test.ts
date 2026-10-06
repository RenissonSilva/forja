import { Attendance } from "@domain/entities/Attendance";
import { Exercise, MuscleGroup } from "@domain/entities/Exercise";
import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { WorkoutPlanExercise } from "@domain/entities/WorkoutPlanExercise";
import { InMemoryAttendanceRepository } from "../testing/InMemoryAttendanceRepository";
import { InMemoryExerciseLogRepository } from "../testing/InMemoryExerciseLogRepository";
import { InMemoryExerciseRepository } from "../testing/InMemoryExerciseRepository";
import { InMemoryWorkoutPlanRepository } from "../testing/InMemoryWorkoutPlanRepository";
import { LogExercisePerformanceUseCase } from "./LogExercisePerformance.usecase";
import { GetWorkoutDayUseCase } from "./GetWorkoutDay.usecase";

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

function makePlanExercise(exerciseId: string) {
  const result = WorkoutPlanExercise.create({
    id: `wpe-${exerciseId}`,
    exerciseId,
    order: 0,
    sets: [{ reps: 10, loadKg: 20 }],
    seatHeight: null,
    seatDistance: null,
    seatIncline: null,
    seatLock: null,
  });
  if (!result.ok) throw new Error("fixture should be valid");
  return result.value;
}

async function seedPlan(repository: InMemoryWorkoutPlanRepository, exerciseIds: string[]) {
  const result = WorkoutPlan.create({
    id: "plan-1",
    profileId: "profile-1",
    name: "Treino A",
    colorTag: "orange",
  });
  if (!result.ok) throw new Error("fixture should be valid");
  const plan = exerciseIds.reduce(
    (current, exerciseId) => current.addExercise(makePlanExercise(exerciseId)),
    result.value,
  );
  await repository.save(plan);
}

async function setup() {
  const exerciseLogRepository = new InMemoryExerciseLogRepository();
  const attendanceRepository = new InMemoryAttendanceRepository();
  const workoutPlanRepository = new InMemoryWorkoutPlanRepository();
  const exerciseRepository = new InMemoryExerciseRepository();
  await seedExercise(exerciseRepository, "supino-reto", "Supino reto", "peito");
  await seedExercise(exerciseRepository, "crucifixo", "Crucifixo", "peito");
  await seedExercise(exerciseRepository, "agachamento", "Agachamento", "perna");

  const log = new LogExercisePerformanceUseCase(exerciseLogRepository);
  const attend = (workoutPlanId: string | null) =>
    attendanceRepository.save(
      Attendance.create({ id: "att-1", profileId: "profile-1", date: "2026-10-14", workoutPlanId }),
    );
  const useCase = new GetWorkoutDayUseCase(
    exerciseLogRepository,
    attendanceRepository,
    workoutPlanRepository,
    exerciseRepository,
  );
  return { log, attend, workoutPlanRepository, useCase };
}

describe("GetWorkoutDayUseCase", () => {
  it("returns only that day's exercises, each with its sets", async () => {
    const { log, useCase } = await setup();
    await log.execute({
      profileId: "profile-1",
      date: "2026-10-14",
      entries: [
        {
          exerciseId: "supino-reto",
          sets: [
            { reps: 12, loadKg: 40 },
            { reps: 10, loadKg: 45 },
          ],
        },
      ],
    });
    await log.execute({
      profileId: "profile-1",
      date: "2026-10-13",
      entries: [{ exerciseId: "agachamento", sets: [{ reps: 10, loadKg: 80 }] }],
    });

    const day = await useCase.execute({ profileId: "profile-1", date: "2026-10-14" });

    expect(day.exercises.map((item) => item.exercise?.name)).toEqual(["Supino reto"]);
    expect(day.exercises[0]?.log.setDetails).toEqual([
      { reps: 12, loadKg: 40 },
      { reps: 10, loadKg: 45 },
    ]);
  });

  it("names the day's plan and follows its exercise order", async () => {
    const { log, attend, workoutPlanRepository, useCase } = await setup();
    await seedPlan(workoutPlanRepository, ["supino-reto", "crucifixo"]);
    await attend("plan-1");
    await log.execute({
      profileId: "profile-1",
      date: "2026-10-14",
      entries: [
        { exerciseId: "agachamento", sets: [{ reps: 10, loadKg: 80 }] },
        { exerciseId: "crucifixo", sets: [{ reps: 12, loadKg: 14 }] },
        { exerciseId: "supino-reto", sets: [{ reps: 12, loadKg: 40 }] },
      ],
    });

    const day = await useCase.execute({ profileId: "profile-1", date: "2026-10-14" });

    expect(day.workoutPlanName).toBe("Treino A");
    expect(day.exercises.map((item) => item.log.exerciseId)).toEqual([
      "supino-reto",
      "crucifixo",
      "agachamento",
    ]);
  });

  it("omits the plan name once the plan was deleted, ordering by name instead", async () => {
    const { log, attend, useCase } = await setup();
    await attend("plan-apagado");
    await log.execute({
      profileId: "profile-1",
      date: "2026-10-14",
      entries: [
        { exerciseId: "supino-reto", sets: [{ reps: 12, loadKg: 40 }] },
        { exerciseId: "crucifixo", sets: [{ reps: 12, loadKg: 14 }] },
      ],
    });

    const day = await useCase.execute({ profileId: "profile-1", date: "2026-10-14" });

    expect(day.workoutPlanName).toBeNull();
    expect(day.exercises.map((item) => item.exercise?.name)).toEqual(["Crucifixo", "Supino reto"]);
  });

  it("keeps an exercise that is no longer in the catalog", async () => {
    const { log, useCase } = await setup();
    await log.execute({
      profileId: "profile-1",
      date: "2026-10-14",
      entries: [{ exerciseId: "apagado", sets: [{ reps: 8, loadKg: 20 }] }],
    });

    const [item] = (await useCase.execute({ profileId: "profile-1", date: "2026-10-14" }))
      .exercises;

    expect(item?.log.exerciseId).toBe("apagado");
    expect(item?.exercise).toBeUndefined();
  });

  it("returns no exercises for a day trained without logs", async () => {
    const { attend, workoutPlanRepository, useCase } = await setup();
    await seedPlan(workoutPlanRepository, ["supino-reto"]);
    await attend("plan-1");

    const day = await useCase.execute({ profileId: "profile-1", date: "2026-10-14" });

    expect(day).toEqual({ date: "2026-10-14", workoutPlanName: "Treino A", exercises: [] });
  });
});
