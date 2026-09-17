import { ExerciseLog } from "@domain/entities/ExerciseLog";
import { ExerciseLogRepository } from "@domain/repositories/ExerciseLogRepository";

export class GetExercisePerformanceHistoryUseCase {
  constructor(private readonly exerciseLogRepository: ExerciseLogRepository) {}

  async execute(input: { profileId: string }): Promise<ExerciseLog[]> {
    return this.exerciseLogRepository.findAllByProfile(input.profileId);
  }
}
