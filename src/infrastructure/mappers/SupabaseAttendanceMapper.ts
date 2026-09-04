import { Attendance } from "@domain/entities/Attendance";

export interface SupabaseAttendanceRow {
  id: string;
  profile_id: string;
  date: string;
  workout_plan_id: string | null;
  completed_at: string;
}

export class SupabaseAttendanceMapper {
  static toDomain(row: SupabaseAttendanceRow): Attendance {
    return Attendance.restore({
      id: row.id,
      profileId: row.profile_id,
      date: row.date,
      workoutPlanId: row.workout_plan_id,
      completedAt: new Date(row.completed_at),
    });
  }

  static toRow(attendance: Attendance): SupabaseAttendanceRow {
    const props = attendance.toProps();
    return {
      id: props.id,
      profile_id: props.profileId,
      date: props.date,
      workout_plan_id: props.workoutPlanId,
      completed_at: props.completedAt.toISOString(),
    };
  }
}
