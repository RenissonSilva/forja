import { Exercise } from "@domain/entities/Exercise";
import { ExerciseLog } from "@domain/entities/ExerciseLog";
import { AttendanceRepository } from "@domain/repositories/AttendanceRepository";
import { ExerciseLogRepository } from "@domain/repositories/ExerciseLogRepository";
import { ExerciseRepository } from "@domain/repositories/ExerciseRepository";
import { WorkoutPlanRepository } from "@domain/repositories/WorkoutPlanRepository";
import { DateKey } from "@shared/date-utils";

export interface WorkoutDayExercise {
  log: ExerciseLog;
  /** Undefined if the exercise left the catalog after being logged. */
  exercise: Exercise | undefined;
}

export interface WorkoutDay {
  date: DateKey;
  /** Null when the day has no plan attached, or the plan was deleted since. */
  workoutPlanName: string | null;
  exercises: WorkoutDayExercise[];
}

export class GetWorkoutDayUseCase {
  constructor(
    private readonly exerciseLogRepository: ExerciseLogRepository,
    private readonly attendanceRepository: AttendanceRepository,
    private readonly workoutPlanRepository: WorkoutPlanRepository,
    private readonly exerciseRepository: ExerciseRepository,
  ) {}

  /** What was trained on a day: the plan's name and every logged exercise with its sets. */
  async execute(input: { profileId: string; date: DateKey }): Promise<WorkoutDay> {
    const [logs, attendance, exercises] = await Promise.all([
      this.exerciseLogRepository.findByDate(input.profileId, input.date),
      this.attendanceRepository.findByDate(input.profileId, input.date),
      this.exerciseRepository.findAll(),
    ]);
    const plan = attendance?.workoutPlanId
      ? await this.workoutPlanRepository.findById(attendance.workoutPlanId)
      : null;

    const exercisesById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
    // Logs carry no position, so the plan's order stands in for the order they were done in.
    const planPosition = new Map(
      [...(plan?.exercises ?? [])]
        .sort((a, b) => a.order - b.order)
        .map((planExercise, index) => [planExercise.exerciseId, index]),
    );
    const positionOf = (log: ExerciseLog) =>
      planPosition.get(log.exerciseId) ?? Number.MAX_SAFE_INTEGER;

    return {
      date: input.date,
      workoutPlanName: plan?.name ?? null,
      exercises: logs
        .map((log) => ({ log, exercise: exercisesById.get(log.exerciseId) }))
        .sort(
          (a, b) =>
            positionOf(a.log) - positionOf(b.log) ||
            (a.exercise?.name ?? "").localeCompare(b.exercise?.name ?? ""),
        ),
    };
  }
}
