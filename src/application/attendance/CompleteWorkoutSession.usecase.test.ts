import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { MarkWorkoutPlanAsTodayUseCase } from "../workout-plans/MarkWorkoutPlanAsToday.usecase";
import { InMemoryAttendanceRepository } from "../testing/InMemoryAttendanceRepository";
import { InMemoryWorkoutPlanRepository } from "../testing/InMemoryWorkoutPlanRepository";
import { CompleteWorkoutSessionUseCase } from "./CompleteWorkoutSession.usecase";

async function seedPlan(repository: InMemoryWorkoutPlanRepository) {
  const result = WorkoutPlan.create({
    id: "plan-1",
    profileId: "profile-1",
    name: "Treino A",
    colorTag: "orange",
  });
  if (!result.ok) throw new Error("fixture should be valid");
  await repository.save(result.value);
}

async function seedPlans(repository: InMemoryWorkoutPlanRepository, ids: string[]) {
  for (const id of ids) {
    const result = WorkoutPlan.create({
      id,
      profileId: "profile-1",
      name: id,
      colorTag: "orange",
    });
    if (!result.ok) throw new Error("fixture should be valid");
    await repository.save(result.value);
  }
}

describe("CompleteWorkoutSessionUseCase", () => {
  it("registers today's attendance for the given plan", async () => {
    const attendanceRepository = new InMemoryAttendanceRepository();
    const workoutPlanRepository = new InMemoryWorkoutPlanRepository();
    await seedPlan(workoutPlanRepository);
    const useCase = new CompleteWorkoutSessionUseCase(attendanceRepository, workoutPlanRepository);

    await useCase.execute({ profileId: "profile-1", workoutPlanId: "plan-1", date: "2026-08-30" });

    const attendance = await attendanceRepository.findByDate("profile-1", "2026-08-30");
    expect(attendance?.workoutPlanId).toBe("plan-1");
  });

  it("fails when the workout plan does not exist", async () => {
    const attendanceRepository = new InMemoryAttendanceRepository();
    const workoutPlanRepository = new InMemoryWorkoutPlanRepository();
    const useCase = new CompleteWorkoutSessionUseCase(attendanceRepository, workoutPlanRepository);

    await expect(
      useCase.execute({ profileId: "profile-1", workoutPlanId: "missing" }),
    ).rejects.toThrow();
  });

  it("records the completion timestamp on the finished plan", async () => {
    const attendanceRepository = new InMemoryAttendanceRepository();
    const workoutPlanRepository = new InMemoryWorkoutPlanRepository();
    await seedPlan(workoutPlanRepository);
    const useCase = new CompleteWorkoutSessionUseCase(attendanceRepository, workoutPlanRepository);

    await useCase.execute({ profileId: "profile-1", workoutPlanId: "plan-1" });

    expect((await workoutPlanRepository.findById("plan-1"))?.lastCompletedAt).not.toBeNull();
  });

  it("hands the today mark to the next plan in the list", async () => {
    const attendanceRepository = new InMemoryAttendanceRepository();
    const workoutPlanRepository = new InMemoryWorkoutPlanRepository();
    await seedPlans(workoutPlanRepository, ["plan-a", "plan-b", "plan-c"]);
    const markUseCase = new MarkWorkoutPlanAsTodayUseCase(workoutPlanRepository);
    await markUseCase.execute({ profileId: "profile-1", workoutPlanId: "plan-a" });
    const useCase = new CompleteWorkoutSessionUseCase(attendanceRepository, workoutPlanRepository);

    await useCase.execute({ profileId: "profile-1", workoutPlanId: "plan-a" });

    expect((await workoutPlanRepository.findById("plan-a"))?.isMarkedToday).toBe(false);
    expect((await workoutPlanRepository.findById("plan-b"))?.isMarkedToday).toBe(true);
    expect((await workoutPlanRepository.findById("plan-c"))?.isMarkedToday).toBe(false);
  });

  it("wraps around to the first plan when the last one in the list is completed", async () => {
    const attendanceRepository = new InMemoryAttendanceRepository();
    const workoutPlanRepository = new InMemoryWorkoutPlanRepository();
    await seedPlans(workoutPlanRepository, ["plan-a", "plan-b", "plan-c"]);
    const markUseCase = new MarkWorkoutPlanAsTodayUseCase(workoutPlanRepository);
    await markUseCase.execute({ profileId: "profile-1", workoutPlanId: "plan-c" });
    const useCase = new CompleteWorkoutSessionUseCase(attendanceRepository, workoutPlanRepository);

    await useCase.execute({ profileId: "profile-1", workoutPlanId: "plan-c" });

    expect((await workoutPlanRepository.findById("plan-a"))?.isMarkedToday).toBe(true);
    expect((await workoutPlanRepository.findById("plan-c"))?.isMarkedToday).toBe(false);
  });

  it("keeps the sole plan marked as today when there is nothing to rotate to", async () => {
    const attendanceRepository = new InMemoryAttendanceRepository();
    const workoutPlanRepository = new InMemoryWorkoutPlanRepository();
    await seedPlan(workoutPlanRepository);
    const markUseCase = new MarkWorkoutPlanAsTodayUseCase(workoutPlanRepository);
    await markUseCase.execute({ profileId: "profile-1", workoutPlanId: "plan-1" });
    const useCase = new CompleteWorkoutSessionUseCase(attendanceRepository, workoutPlanRepository);

    await useCase.execute({ profileId: "profile-1", workoutPlanId: "plan-1" });

    expect((await workoutPlanRepository.findById("plan-1"))?.isMarkedToday).toBe(true);
  });

  it("advances the rotation even when the completed plan wasn't marked as today", async () => {
    const attendanceRepository = new InMemoryAttendanceRepository();
    const workoutPlanRepository = new InMemoryWorkoutPlanRepository();
    await seedPlans(workoutPlanRepository, ["plan-a", "plan-b", "plan-c"]);
    const markUseCase = new MarkWorkoutPlanAsTodayUseCase(workoutPlanRepository);
    await markUseCase.execute({ profileId: "profile-1", workoutPlanId: "plan-c" });
    const useCase = new CompleteWorkoutSessionUseCase(attendanceRepository, workoutPlanRepository);

    await useCase.execute({ profileId: "profile-1", workoutPlanId: "plan-a" });

    expect((await workoutPlanRepository.findById("plan-b"))?.isMarkedToday).toBe(true);
    expect((await workoutPlanRepository.findById("plan-c"))?.isMarkedToday).toBe(false);
  });
});
