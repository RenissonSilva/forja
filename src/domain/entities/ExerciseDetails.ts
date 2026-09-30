export interface ExerciseDetailsRelated {
  externalId: string;
  name: string;
}

export interface ExerciseDetailsProps {
  externalId: string;
  name: string;
  gifUrl: string;
  targetMuscle: string;
  secondaryMuscles: string[];
  equipment: string;
  bodyPart: string;
  instructions: string[];
  tips: string[];
  related: ExerciseDetailsRelated[];
  isTranslated: boolean;
}

export class ExerciseDetails {
  private constructor(private readonly props: ExerciseDetailsProps) {}

  static create(props: ExerciseDetailsProps): ExerciseDetails {
    return new ExerciseDetails(props);
  }

  get externalId(): string {
    return this.props.externalId;
  }

  get name(): string {
    return this.props.name;
  }

  get gifUrl(): string {
    return this.props.gifUrl;
  }

  get targetMuscle(): string {
    return this.props.targetMuscle;
  }

  get secondaryMuscles(): string[] {
    return this.props.secondaryMuscles;
  }

  get equipment(): string {
    return this.props.equipment;
  }

  get bodyPart(): string {
    return this.props.bodyPart;
  }

  get instructions(): string[] {
    return this.props.instructions;
  }

  get tips(): string[] {
    return this.props.tips;
  }

  get related(): ExerciseDetailsRelated[] {
    return this.props.related;
  }

  get isTranslated(): boolean {
    return this.props.isTranslated;
  }
}
