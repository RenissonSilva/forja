import { Attendance } from "@domain/entities/Attendance";
import { attendances } from "../database/schema";

type AttendanceRow = typeof attendances.$inferSelect;
type AttendanceInsertRow = typeof attendances.$inferInsert;

export class AttendanceMapper {
  static toDomain(row: AttendanceRow): Attendance {
    return Attendance.restore({
      id: row.id,
      profileId: row.profileId,
      date: row.date,
      workoutPlanId: row.workoutPlanId,
      completedAt: row.completedAt,
    });
  }

  static toRow(attendance: Attendance): AttendanceInsertRow {
    const props = attendance.toProps();
    return {
      id: props.id,
      profileId: props.profileId,
      date: props.date,
      workoutPlanId: props.workoutPlanId,
      completedAt: props.completedAt,
    };
  }
}
