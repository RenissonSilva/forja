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
