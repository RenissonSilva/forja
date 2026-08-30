import { DateKey } from "@shared/date-utils";

export interface AttendanceProps {
  id: string;
  profileId: string;
  date: DateKey;
  workoutPlanId: string | null;
  completedAt: Date;
}

export class Attendance {
  private constructor(private readonly props: AttendanceProps) {}

  static create(props: Omit<AttendanceProps, "completedAt"> & { now?: Date }): Attendance {
    return new Attendance({
      id: props.id,
      profileId: props.profileId,
      date: props.date,
      workoutPlanId: props.workoutPlanId,
      completedAt: props.now ?? new Date(),
    });
  }

  static restore(props: AttendanceProps): Attendance {
    return new Attendance(props);
  }

  get id(): string {
    return this.props.id;
  }

  get profileId(): string {
    return this.props.profileId;
  }

  get date(): DateKey {
    return this.props.date;
  }

  get workoutPlanId(): string | null {
    return this.props.workoutPlanId;
  }

  get completedAt(): Date {
    return this.props.completedAt;
  }

  toProps(): AttendanceProps {
    return { ...this.props };
  }
}
