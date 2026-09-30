import { ExerciseInfoSummary } from "@domain/repositories/ExerciseInfoRepository";
import { normalizeText, translateKnownTerms } from "./exerciseNameDictionary";

const MIN_OVERLAP_SCORE = 0.5;

function tokenize(text: string): Set<string> {
  return new Set(text.split(" ").filter((token) => token.length > 0));
}

function overlapScore(queryTokens: Set<string>, candidateTokens: Set<string>): number {
  if (queryTokens.size === 0) return 0;
  let matches = 0;
  for (const token of queryTokens) {
    if (candidateTokens.has(token)) matches += 1;
  }
  return matches / queryTokens.size;
}

/**
 * Matches a (possibly PT-BR) exercise name against the ExerciseDB English catalog.
 * Prefers returning no match over a wrong one — callers should hide the help
 * icon rather than show unrelated exercise info.
 */
export function matchExerciseName(
  query: string,
  candidates: ExerciseInfoSummary[],
): ExerciseInfoSummary | null {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return null;

  const translatedQuery = translateKnownTerms(normalizedQuery);
  const queryTokens = tokenize(translatedQuery);
  if (queryTokens.size === 0) return null;

  let best: ExerciseInfoSummary | null = null;
  let bestScore = 0;

  for (const candidate of candidates) {
    const candidateTokens = tokenize(normalizeText(candidate.name));
    if (candidateTokens.size === 0) continue;

    if (normalizeText(candidate.name) === translatedQuery) {
      return candidate;
    }

    const score = Math.max(
      overlapScore(queryTokens, candidateTokens),
      overlapScore(candidateTokens, queryTokens),
    );

    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return bestScore >= MIN_OVERLAP_SCORE ? best : null;
}
