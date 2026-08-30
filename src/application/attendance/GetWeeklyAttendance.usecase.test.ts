import { Attendance } from "@domain/entities/Attendance";
import { InMemoryAttendanceRepository } from "../testing/InMemoryAttendanceRepository";
import { GetWeeklyAttendanceUseCase } from "./GetWeeklyAttendance.usecase";

describe("GetWeeklyAttendanceUseCase", () => {
  it("maps attendance onto the Monday-Sunday week containing referenceDate", async () => {
    const repository = new InMemoryAttendanceRepository();
    // 2026-08-26 is a Wednesday; its week runs 2026-08-24 (Mon) to 2026-08-30 (Sun).
    const referenceDate = new Date("2026-08-26T12:00:00");

    await repository.save(
      Attendance.create({
        id: "att-1",
        profileId: "profile-1",
        date: "2026-08-24",
        workoutPlanId: "plan-1",
      }),
    );

    const useCase = new GetWeeklyAttendanceUseCase(repository);
    const days = await useCase.execute({ profileId: "profile-1", referenceDate });

    expect(days).toHaveLength(7);
    expect(days[0]?.dateKey).toBe("2026-08-24");
    expect(days[0]?.attendance?.workoutPlanId).toBe("plan-1");
    expect(days[6]?.dateKey).toBe("2026-08-30");
    expect(days[1]?.attendance).toBeNull();
  });

  it("scopes attendance to the given profile", async () => {
    const repository = new InMemoryAttendanceRepository();
    const referenceDate = new Date("2026-08-26T12:00:00");

    await repository.save(
      Attendance.create({
        id: "att-1",
        profileId: "other-profile",
        date: "2026-08-24",
        workoutPlanId: "plan-1",
      }),
    );

    const useCase = new GetWeeklyAttendanceUseCase(repository);
    const days = await useCase.execute({ profileId: "profile-1", referenceDate });

    expect(days.every((day) => day.attendance === null)).toBe(true);
  });
});
