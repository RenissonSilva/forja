import {
  ExerciseInfoDetailsRaw,
  ExerciseInfoRepository,
  ExerciseInfoSummary,
} from "@domain/repositories/ExerciseInfoRepository";
import { AsyncStorageCache } from "@infrastructure/cache/AsyncStorageCache";

const INDEX_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const DETAIL_TTL_MS = 90 * 24 * 60 * 60 * 1000;

export class CachedExerciseInfoRepository implements ExerciseInfoRepository {
  constructor(
    private readonly remote: ExerciseInfoRepository,
    private readonly cache: AsyncStorageCache,
  ) {}

  listAll(): Promise<ExerciseInfoSummary[]> {
    return this.cache.getOrSet("exercisedb:index:v1", INDEX_TTL_MS, () => this.remote.listAll());
  }

  getDetails(externalId: string): Promise<ExerciseInfoDetailsRaw | null> {
    return this.cache.getOrSet(`exercisedb:detail:v1:${externalId}`, DETAIL_TTL_MS, () =>
      this.remote.getDetails(externalId),
    );
  }
}
