export interface ExerciseDbApiItem {
  exerciseId: string;
  name: string;
  gifUrl: string;
  bodyParts: string[];
  equipments: string[];
  targetMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
}

interface ExerciseDbListResponse {
  data: ExerciseDbApiItem[];
  meta?: { hasNextPage?: boolean };
}

interface ExerciseDbDetailResponse {
  data: ExerciseDbApiItem;
}

const PAGE_SIZE = 25;
const MAX_PAGES = 100;

export class ExerciseDbHttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly timeoutMs: number,
  ) {}

  async fetchAllLite(): Promise<ExerciseDbApiItem[]> {
    const items: ExerciseDbApiItem[] = [];

    for (let page = 0; page < MAX_PAGES; page += 1) {
      const offset = page * PAGE_SIZE;
      const response = await this.getJson<ExerciseDbListResponse>(
        `/exercises?limit=${PAGE_SIZE}&offset=${offset}`,
      );
      if (!response?.data?.length) break;

      items.push(...response.data);
      if (!response.meta?.hasNextPage) break;
    }

    return items;
  }

  async fetchById(exerciseId: string): Promise<ExerciseDbApiItem | null> {
    const response = await this.getJson<ExerciseDbDetailResponse>(
      `/exercises/${encodeURIComponent(exerciseId)}`,
    );
    return response?.data ?? null;
  }

  private async getJson<T>(path: string): Promise<T | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, { signal: controller.signal });
      if (!response.ok) return null;
      return (await response.json()) as T;
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}
