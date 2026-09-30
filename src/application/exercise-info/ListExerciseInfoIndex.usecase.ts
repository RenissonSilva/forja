import {
  ExerciseInfoRepository,
  ExerciseInfoSummary,
} from "@domain/repositories/ExerciseInfoRepository";

export class ListExerciseInfoIndexUseCase {
  constructor(private readonly exerciseInfoRepository: ExerciseInfoRepository) {}

  execute(): Promise<ExerciseInfoSummary[]> {
    return this.exerciseInfoRepository.listAll();
  }
}
