import {
  InvalidWorkoutPlanNameError,
  WorkoutPlanExerciseNotFoundError,
} from "../errors/WorkoutPlanErrors";
import { Result, err, ok } from "@shared/result";
import { WorkoutPlanExercise } from "./WorkoutPlanExercise";

export const WORKOUT_PLAN_COLOR_TAGS = ["orange", "blue", "gold", "green"] as const;
export type WorkoutPlanColorTag = (typeof WORKOUT_PLAN_COLOR_TAGS)[number];

/** Heuristic derived from the FORJA mockups (~7-8 exercícios : ~55-65 min). */
const ESTIMATED_MINUTES_PER_EXERCISE = 8;

export interface WorkoutPlanProps {
  id: string;
  profileId: string;
  name: string;
  colorTag: WorkoutPlanColorTag;
  isMarkedToday: boolean;
  exercises: WorkoutPlanExercise[];
  createdAt: Date;
  updatedAt: Date;
}

export class WorkoutPlan {
  private constructor(private readonly props: WorkoutPlanProps) {}

  static create(
    props: Pick<WorkoutPlanProps, "id" | "profileId" | "name" | "colorTag"> & { now?: Date },
  ): Result<WorkoutPlan, InvalidWorkoutPlanNameError> {
    const nameResult = WorkoutPlan.validateName(props.name);
    if (!nameResult.ok) return nameResult;

    const now = props.now ?? new Date();
    return ok(
      new WorkoutPlan({
        id: props.id,
        profileId: props.profileId,
        name: nameResult.value,
        colorTag: props.colorTag,
        isMarkedToday: false,
        exercises: [],
        createdAt: now,
        updatedAt: now,
      }),
    );
  }

  static restore(props: WorkoutPlanProps): WorkoutPlan {
    return new WorkoutPlan({ ...props, exercises: [...props.exercises] });
  }

  rename(name: string, now: Date = new Date()): Result<WorkoutPlan, InvalidWorkoutPlanNameError> {
    const nameResult = WorkoutPlan.validateName(name);
    if (!nameResult.ok) return nameResult;
    return ok(new WorkoutPlan({ ...this.props, name: nameResult.value, updatedAt: now }));
  }

  addExercise(exercise: WorkoutPlanExercise, now: Date = new Date()): WorkoutPlan {
    const ordered = exercise.withOrder(this.props.exercises.length);
    return new WorkoutPlan({
      ...this.props,
      exercises: [...this.props.exercises, ordered],
      updatedAt: now,
    });
  }

  removeExercise(workoutPlanExerciseId: string, now: Date = new Date()): WorkoutPlan {
    const remaining = this.props.exercises
      .filter((exercise) => exercise.id !== workoutPlanExerciseId)
      .map((exercise, index) => exercise.withOrder(index));
    return new WorkoutPlan({ ...this.props, exercises: remaining, updatedAt: now });
  }

  replaceExercise(
    workoutPlanExerciseId: string,
    updated: WorkoutPlanExercise,
    now: Date = new Date(),
  ): Result<WorkoutPlan, WorkoutPlanExerciseNotFoundError> {
    const index = this.props.exercises.findIndex(
      (exercise) => exercise.id === workoutPlanExerciseId,
    );
    if (index === -1) {
      return err(new WorkoutPlanExerciseNotFoundError(workoutPlanExerciseId));
    }
    const exercises = [...this.props.exercises];
    exercises[index] = updated.withOrder(this.props.exercises[index]!.order);
    return ok(new WorkoutPlan({ ...this.props, exercises, updatedAt: now }));
  }

  markAsToday(now: Date = new Date()): WorkoutPlan {
    return new WorkoutPlan({ ...this.props, isMarkedToday: true, updatedAt: now });
  }

  unmarkAsToday(now: Date = new Date()): WorkoutPlan {
    return new WorkoutPlan({ ...this.props, isMarkedToday: false, updatedAt: now });
  }

  private static validateName(name: string): Result<string, InvalidWorkoutPlanNameError> {
    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 60) {
      return err(new InvalidWorkoutPlanNameError());
    }
    return ok(trimmed);
  }

  get id(): string {
    return this.props.id;
  }

  get profileId(): string {
    return this.props.profileId;
  }

  get name(): string {
    return this.props.name;
  }

  get colorTag(): WorkoutPlanColorTag {
    return this.props.colorTag;
  }

  get isMarkedToday(): boolean {
    return this.props.isMarkedToday;
  }

  get exercises(): readonly WorkoutPlanExercise[] {
    return this.props.exercises;
  }

  get estimatedDurationMinutes(): number {
    return this.props.exercises.length * ESTIMATED_MINUTES_PER_EXERCISE;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toProps(): WorkoutPlanProps {
    return { ...this.props, exercises: [...this.props.exercises] };
  }
}
