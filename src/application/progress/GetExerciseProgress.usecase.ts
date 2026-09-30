import { Exercise } from "@domain/entities/Exercise";
import { ExerciseLogRepository } from "@domain/repositories/ExerciseLogRepository";
import { ExerciseRepository } from "@domain/repositories/ExerciseRepository";
import { ExerciseProgress, buildExerciseProgress } from "@domain/services/exerciseProgression";

export interface ExerciseProgressItem extends ExerciseProgress {
  /** Undefined if the exercise left the catalog after being logged. */
  exercise: Exercise | undefined;
}

export class GetExerciseProgressUseCase {
  constructor(
    private readonly exerciseLogRepository: ExerciseLogRepository,
    private readonly exerciseRepository: ExerciseRepository,
  ) {}

  /** Every logged exercise, most recently trained first (same day: by name). */
  async execute(input: { profileId: string }): Promise<ExerciseProgressItem[]> {
    const [logs, exercises] = await Promise.all([
      this.exerciseLogRepository.findAllByProfile(input.profileId),
      this.exerciseRepository.findAll(),
    ]);
    const exercisesById = new Map(exercises.map((exercise) => [exercise.id, exercise]));

    return buildExerciseProgress(logs)
      .map((progress) => ({ ...progress, exercise: exercisesById.get(progress.exerciseId) }))
      .sort(
        (a, b) =>
          lastDate(b).localeCompare(lastDate(a)) ||
          (a.exercise?.name ?? "").localeCompare(b.exercise?.name ?? ""),
      );
  }
}

function lastDate(item: ExerciseProgress): string {
  return item.sessions[item.sessions.length - 1]?.date ?? "";
}
