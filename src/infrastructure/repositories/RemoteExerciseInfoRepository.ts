import {
  ExerciseInfoDetailsRaw,
  ExerciseInfoRepository,
  ExerciseInfoSummary,
} from "@domain/repositories/ExerciseInfoRepository";
import { ExerciseDbHttpClient } from "@infrastructure/http/ExerciseDbHttpClient";
import { ExerciseDbMapper } from "@infrastructure/mappers/ExerciseDbMapper";

export class RemoteExerciseInfoRepository implements ExerciseInfoRepository {
  constructor(private readonly client: ExerciseDbHttpClient) {}

  async listAll(): Promise<ExerciseInfoSummary[]> {
    const items = await this.client.fetchAllLite();
    return items.map(ExerciseDbMapper.toSummary);
  }

  async getDetails(externalId: string): Promise<ExerciseInfoDetailsRaw | null> {
    const item = await this.client.fetchById(externalId);
    return item ? ExerciseDbMapper.toDetailsRaw(item) : null;
  }
}
