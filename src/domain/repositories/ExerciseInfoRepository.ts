export interface ExerciseInfoSummary {
  externalId: string;
  name: string;
  bodyPart: string;
  targetMuscle: string;
}

export interface ExerciseInfoDetailsRaw {
  externalId: string;
  name: string;
  bodyPart: string;
  targetMuscle: string;
  secondaryMuscles: string[];
  equipment: string;
  gifUrl: string;
  instructions: string[];
}

export interface ExerciseInfoRepository {
  listAll(): Promise<ExerciseInfoSummary[]>;
  getDetails(externalId: string): Promise<ExerciseInfoDetailsRaw | null>;
}
