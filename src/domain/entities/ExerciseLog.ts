import {
  InvalidLoadError,
  InvalidRepsError,
  InvalidSetsError,
} from "../errors/WorkoutPlanErrors";
import { Result, err, ok } from "@shared/result";
import { DateKey } from "@shared/date-utils";

export interface ExerciseLogProps {
  id: string;
  profileId: string;
  exerciseId: string;
  date: DateKey;
  sets: number;
  reps: number;
  loadKg: number;
}

export type ExerciseLogValidationError = InvalidSetsError | InvalidRepsError | InvalidLoadError;

export class ExerciseLog {
  private constructor(private readonly props: ExerciseLogProps) {}

  static create(props: ExerciseLogProps): Result<ExerciseLog, ExerciseLogValidationError> {
    if (!Number.isInteger(props.sets) || props.sets < 1 || props.sets > 20) {
      return err(new InvalidSetsError(props.sets));
    }
    if (!Number.isInteger(props.reps) || props.reps < 1 || props.reps > 100) {
      return err(new InvalidRepsError(props.reps));
    }
    if (!Number.isFinite(props.loadKg) || props.loadKg < 0 || props.loadKg > 500) {
      return err(new InvalidLoadError(props.loadKg));
    }

    return ok(new ExerciseLog({ ...props }));
  }

  static restore(props: ExerciseLogProps): ExerciseLog {
    return new ExerciseLog(props);
  }

  get id(): string {
    return this.props.id;
  }

  get profileId(): string {
    return this.props.profileId;
  }

  get exerciseId(): string {
    return this.props.exerciseId;
  }

  get date(): DateKey {
    return this.props.date;
  }

  get sets(): number {
    return this.props.sets;
  }

  get reps(): number {
    return this.props.reps;
  }

  get loadKg(): number {
    return this.props.loadKg;
  }

  toProps(): ExerciseLogProps {
    return { ...this.props };
  }
}
