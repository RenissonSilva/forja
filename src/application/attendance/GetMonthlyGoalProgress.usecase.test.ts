import { Attendance } from "@domain/entities/Attendance";
import { Profile } from "@domain/entities/Profile";
import { InMemoryAttendanceRepository } from "../testing/InMemoryAttendanceRepository";
import { InMemoryProfileRepository } from "../testing/InMemoryProfileRepository";
import { GetMonthlyGoalProgressUseCase } from "./GetMonthlyGoalProgress.usecase";

async function seedProfile(repository: InMemoryProfileRepository, weeklyGoalDays: number) {
  const result = Profile.create({
    id: "profile-1",
    name: "Rafael Lima",
    avatarUri: null,
    heightCm: 178,
    weeklyGoalDays,
    remindersEnabled: true,
  });
  if (!result.ok) throw new Error("fixture should be valid");
  await repository.save(result.value);
}

async function seedAttendance(repository: InMemoryAttendanceRepository, dates: string[]) {
  for (const date of dates) {
    const attendance = Attendance.create({
      id: date,
      profileId: "profile-1",
      date,
      workoutPlanId: "plan-1",
    });
    await repository.save(attendance);
  }
}

// The same 15 trained days shown on the FORJA "Histórico" reference screen for August 2026.
const AUGUST_TRAINED_DATES = [
  "2026-08-03",
  "2026-08-04",
  "2026-08-06",
  "2026-08-07",
  "2026-08-10",
  "2026-08-12",
  "2026-08-14",
  "2026-08-17",
  "2026-08-18",
  "2026-08-20",
  "2026-08-22",
  "2026-08-24",
  "2026-08-25",
  "2026-08-27",
  "2026-08-28",
];

describe("GetMonthlyGoalProgressUseCase", () => {
  it("matches the FORJA reference screen (4 dias/semana, 15/16, 94%, faltam 1)", async () => {
    const profileRepository = new InMemoryProfileRepository();
    const attendanceRepository = new InMemoryAttendanceRepository();
    await seedProfile(profileRepository, 4);
    await seedAttendance(attendanceRepository, AUGUST_TRAINED_DATES);

    const useCase = new GetMonthlyGoalProgressUseCase(attendanceRepository, profileRepository);
    const progress = await useCase.execute({
      profileId: "profile-1",
      referenceDate: new Date("2026-08-15T12:00:00"),
    });

    expect(progress).toEqual({ completed: 15, goal: 16, progressPercentage: 94, remaining: 1 });
  });

  it("ignores attendance records outside the reference month", async () => {
    const profileRepository = new InMemoryProfileRepository();
    const attendanceRepository = new InMemoryAttendanceRepository();
    await seedProfile(profileRepository, 4);
    await seedAttendance(attendanceRepository, ["2026-07-31", "2026-08-01", "2026-09-01"]);

    const useCase = new GetMonthlyGoalProgressUseCase(attendanceRepository, profileRepository);
    const progress = await useCase.execute({
      profileId: "profile-1",
      referenceDate: new Date("2026-08-15T12:00:00"),
    });

    expect(progress.completed).toBe(1);
  });

  it("throws when there is no profile yet", async () => {
    const profileRepository = new InMemoryProfileRepository();
    const attendanceRepository = new InMemoryAttendanceRepository();
    const useCase = new GetMonthlyGoalProgressUseCase(attendanceRepository, profileRepository);

    await expect(useCase.execute({ profileId: "profile-1" })).rejects.toThrow();
  });
});
