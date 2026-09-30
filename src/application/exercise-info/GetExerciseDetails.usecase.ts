import { ExerciseDetails } from "@domain/entities/ExerciseDetails";
import {
  ExerciseInfoRepository,
  ExerciseInfoSummary,
} from "@domain/repositories/ExerciseInfoRepository";
import { TranslatorRepository } from "@domain/repositories/TranslatorRepository";
import { matchExerciseName } from "@domain/services/matchExerciseName";

const RELATED_LIMIT = 6;
const GENERIC_SAFETY_TIP =
  "Movimente-se de forma controlada e evite travar a articulação no fim do movimento.";

interface GetExerciseDetailsInput {
  exerciseName: string;
  isCustom: boolean;
}

export class GetExerciseDetailsUseCase {
  constructor(
    private readonly exerciseInfoRepository: ExerciseInfoRepository,
    private readonly translator: TranslatorRepository,
  ) {}

  async execute(input: GetExerciseDetailsInput): Promise<ExerciseDetails | null> {
    if (input.isCustom) return null;

    const candidates = await this.exerciseInfoRepository.listAll();
    const match = matchExerciseName(input.exerciseName, candidates);
    if (!match) return null;

    const details = await this.exerciseInfoRepository.getDetails(match.externalId);
    if (!details) return null;

    const related = this.findRelated(candidates, match, details.bodyPart, details.targetMuscle);

    const textsToTranslate = [
      details.targetMuscle,
      details.equipment,
      details.bodyPart,
      ...details.secondaryMuscles,
      ...related.map((item) => item.name),
    ];

    const [translatedInstructions, translatedFields] = await Promise.all([
      this.translator.translateMany(details.instructions, "en", "pt-BR"),
      this.translator.translateMany(textsToTranslate, "en", "pt-BR"),
    ]);

    let cursor = 0;
    const targetMuscle = translatedFields[cursor++] ?? details.targetMuscle;
    const equipment = translatedFields[cursor++] ?? details.equipment;
    const bodyPart = translatedFields[cursor++] ?? details.bodyPart;
    const secondaryMuscles = details.secondaryMuscles.map(
      (original) => translatedFields[cursor++] ?? original,
    );
    const translatedRelated = related.map((item) => ({
      externalId: item.externalId,
      name: translatedFields[cursor++] ?? item.name,
    }));

    const isTranslated =
      targetMuscle !== details.targetMuscle ||
      translatedInstructions.join("") !== details.instructions.join("");

    return ExerciseDetails.create({
      externalId: details.externalId,
      name: details.name,
      gifUrl: details.gifUrl,
      targetMuscle,
      secondaryMuscles,
      equipment,
      bodyPart,
      instructions: translatedInstructions,
      tips: this.buildTips(equipment, secondaryMuscles),
      related: translatedRelated,
      isTranslated,
    });
  }

  private findRelated(
    candidates: ExerciseInfoSummary[],
    match: ExerciseInfoSummary,
    bodyPart: string,
    targetMuscle: string,
  ): ExerciseInfoSummary[] {
    return candidates
      .filter(
        (candidate) =>
          candidate.externalId !== match.externalId &&
          (candidate.targetMuscle === targetMuscle || candidate.bodyPart === bodyPart),
      )
      .slice(0, RELATED_LIMIT);
  }

  private buildTips(equipment: string, secondaryMuscles: string[]): string[] {
    const tips: string[] = [];
    if (equipment) tips.push(`Equipamento: ${equipment}.`);
    if (secondaryMuscles.length > 0) {
      tips.push(`Também ativa: ${secondaryMuscles.join(", ")}.`);
    }
    tips.push(GENERIC_SAFETY_TIP);
    return tips;
  }
}
