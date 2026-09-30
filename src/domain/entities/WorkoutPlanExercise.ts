import {
  InvalidDurationError,
  InvalidLoadError,
  InvalidRepsError,
  InvalidSetsError,
} from "../errors/WorkoutPlanErrors";
import { MAX_DURATION_SECONDS } from "@shared/duration";
import { Result, err, ok } from "@shared/result";

/**
 * Target for one set — reps and load can differ from set to set. Timed sets
 * (core, cardio) carry `durationSeconds` instead, and their reps are ignored.
 */
export interface WorkoutSet {
  reps: number;
  loadKg: number;
  durationSeconds?: number;
}

export const MAX_SETS = 20;

export interface WorkoutPlanExerciseProps {
  id: string;
  exerciseId: string;
  order: number;
  sets: WorkoutSet[];
  seatHeight: number | null;
  seatDistance: number | null;
  seatIncline: number | null;
  seatLock: number | null;
}

export type WorkoutPlanExerciseValidationError =
  InvalidSetsError | InvalidRepsError | InvalidDurationError | InvalidLoadError;

export class WorkoutPlanExercise {
  private constructor(private readonly props: WorkoutPlanExerciseProps) {}

  static create(
    props: WorkoutPlanExerciseProps,
  ): Result<WorkoutPlanExercise, WorkoutPlanExerciseValidationError> {
    if (props.sets.length < 1 || props.sets.length > MAX_SETS) {
      return err(new InvalidSetsError(props.sets.length));
    }
    for (const set of props.sets) {
      if (set.durationSeconds !== undefined) {
        const duration = set.durationSeconds;
        if (!Number.isInteger(duration) || duration < 1 || duration > MAX_DURATION_SECONDS) {
          return err(new InvalidDurationError(duration));
        }
      } else if (!Number.isInteger(set.reps) || set.reps < 1 || set.reps > 100) {
        return err(new InvalidRepsError(set.reps));
      }
      if (!Number.isFinite(set.loadKg) || set.loadKg < 0 || set.loadKg > 500) {
        return err(new InvalidLoadError(set.loadKg));
      }
    }

    return ok(new WorkoutPlanExercise({ ...props, sets: props.sets.map((set) => ({ ...set })) }));
  }

  static restore(props: WorkoutPlanExerciseProps): WorkoutPlanExercise {
    return new WorkoutPlanExercise(props);
  }

  withOrder(order: number): WorkoutPlanExercise {
    return new WorkoutPlanExercise({ ...this.props, order });
  }

  get id(): string {
    return this.props.id;
  }

  get exerciseId(): string {
    return this.props.exerciseId;
  }

  get order(): number {
    return this.props.order;
  }

  get sets(): readonly WorkoutSet[] {
    return this.props.sets;
  }

  get seatHeight(): number | null {
    return this.props.seatHeight;
  }

  get seatDistance(): number | null {
    return this.props.seatDistance;
  }

  get seatIncline(): number | null {
    return this.props.seatIncline;
  }

  get seatLock(): number | null {
    return this.props.seatLock;
  }

  toProps(): WorkoutPlanExerciseProps {
    return { ...this.props, sets: this.props.sets.map((set) => ({ ...set })) };
  }
}
