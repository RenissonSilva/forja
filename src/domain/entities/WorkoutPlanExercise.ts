import { InvalidLoadError, InvalidRepsError, InvalidSetsError } from "../errors/WorkoutPlanErrors";
import { Result, err, ok } from "@shared/result";

export interface WorkoutPlanExerciseProps {
  id: string;
  exerciseId: string;
  order: number;
  sets: number;
  reps: number;
  loadKg: number;
  seatAdjustment: string | null;
}

export type WorkoutPlanExerciseValidationError =
  InvalidSetsError | InvalidRepsError | InvalidLoadError;

export class WorkoutPlanExercise {
  private constructor(private readonly props: WorkoutPlanExerciseProps) {}

  static create(
    props: WorkoutPlanExerciseProps,
  ): Result<WorkoutPlanExercise, WorkoutPlanExerciseValidationError> {
    if (!Number.isInteger(props.sets) || props.sets < 1 || props.sets > 20) {
      return err(new InvalidSetsError(props.sets));
    }
    if (!Number.isInteger(props.reps) || props.reps < 1 || props.reps > 100) {
      return err(new InvalidRepsError(props.reps));
    }
    if (!Number.isFinite(props.loadKg) || props.loadKg < 0 || props.loadKg > 500) {
      return err(new InvalidLoadError(props.loadKg));
    }

    const seatAdjustment = props.seatAdjustment?.trim() || null;
    return ok(new WorkoutPlanExercise({ ...props, seatAdjustment }));
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

  get sets(): number {
    return this.props.sets;
  }

  get reps(): number {
    return this.props.reps;
  }

  get loadKg(): number {
    return this.props.loadKg;
  }

  get seatAdjustment(): string | null {
    return this.props.seatAdjustment;
  }

  toProps(): WorkoutPlanExerciseProps {
    return { ...this.props };
  }
}
