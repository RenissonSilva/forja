import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
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
});
