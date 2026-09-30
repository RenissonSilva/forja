import { InvalidExerciseNameError } from "../errors/WorkoutPlanErrors";
import { Result, err, ok } from "@shared/result";

export const MUSCLE_GROUPS = [
  "peito",
  "costas",
  "perna",
  "ombro",
  "biceps",
  "triceps",
  "core",
  "cardio",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

/** Core and cardio sets are done for time; every other group counts reps. */
const TIMED_MUSCLE_GROUPS: readonly MuscleGroup[] = ["core", "cardio"];

export interface ExerciseProps {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  isCustom: boolean;
  createdAt: Date;
}

export class Exercise {
  private constructor(private readonly props: ExerciseProps) {}

  static create(
    props: Omit<ExerciseProps, "createdAt"> & { now?: Date },
  ): Result<Exercise, InvalidExerciseNameError> {
    const trimmed = props.name.trim();
    if (trimmed.length < 1 || trimmed.length > 60) {
      return err(new InvalidExerciseNameError());
    }

    return ok(
      new Exercise({
        id: props.id,
        name: trimmed,
        muscleGroup: props.muscleGroup,
        isCustom: props.isCustom,
        createdAt: props.now ?? new Date(),
      }),
    );
  }

  static restore(props: ExerciseProps): Exercise {
    return new Exercise(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get muscleGroup(): MuscleGroup {
    return this.props.muscleGroup;
  }

  /** Sets are measured in time (MM:SS) instead of reps. */
  get isTimed(): boolean {
    return TIMED_MUSCLE_GROUPS.includes(this.props.muscleGroup);
  }

  /** Cardio has no load to track. */
  get usesLoad(): boolean {
    return this.props.muscleGroup !== "cardio";
  }

  get isCustom(): boolean {
    return this.props.isCustom;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  toProps(): ExerciseProps {
    return { ...this.props };
  }
}
