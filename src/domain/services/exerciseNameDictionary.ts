/**
 * Curated PT-BR -> EN gym vocabulary, used to bridge exercise names before
 * matching them against the (English-only) ExerciseDB catalog.
 * Keys/values are already normalized (lowercase, no accents) by normalizeText.
 */
export const EXERCISE_NAME_DICTIONARY: Record<string, string> = {
  supino: "bench press",
  "supino reto": "bench press",
  "supino inclinado": "incline bench press",
  "supino declinado": "decline bench press",
  agachamento: "squat",
  "agachamento livre": "barbell squat",
  "agachamento smith": "smith machine squat",
  "leg press": "leg press",
  "cadeira extensora": "leg extension",
  "cadeira flexora": "leg curl",
  "mesa flexora": "lying leg curl",
  "stiff": "stiff-legged deadlift",
  levantamento: "deadlift",
  terra: "deadlift",
  "levantamento terra": "deadlift",
  panturrilha: "calf raise",
  "elevacao de panturrilha": "calf raise",
  rosca: "curl",
  "rosca direta": "curl",
  "rosca alternada": "alternate curl",
  "rosca martelo": "hammer curl",
  "rosca scott": "preacher curl",
  triceps: "triceps",
  "triceps pulley": "triceps pushdown",
  "triceps testa": "skullcrusher",
  "triceps frances": "french press",
  remada: "row",
  "remada curvada": "bent over row",
  "remada baixa": "seated row",
  "remada cavalinho": "t-bar row",
  "remada unilateral": "one arm row",
  puxada: "pulldown",
  "puxada frente": "lat pulldown",
  "puxada alta": "lat pulldown",
  "barra fixa": "pull-up",
  "barra fixa supinada": "chin-up",
  desenvolvimento: "shoulder press",
  "desenvolvimento militar": "military press",
  "desenvolvimento com halteres": "dumbbell shoulder press",
  elevacao: "raise",
  "elevacao lateral": "lateral raise",
  "elevacao frontal": "front raise",
  crucifixo: "fly",
  "crucifixo inclinado": "incline fly",
  crossover: "cable crossover",
  abdominal: "crunch",
  "abdominal infra": "leg raise",
  "abdominal supra": "crunch",
  prancha: "plank",
  afundo: "lunge",
  passada: "walking lunge",
  gluteo: "glute",
  "elevacao pelvica": "hip thrust",
  "cadeira abdutora": "hip abduction",
  "cadeira adutora": "hip adduction",
  encolhimento: "shrug",
  "voador peitoral": "pec deck fly",
  "peck deck": "pec deck fly",
  flexao: "push-up",
  "flexao de braco": "push-up",
  mergulho: "dips",
  paralelas: "dips",
  abducao: "abduction",
  adducao: "adduction",
  gemeos: "calf raise",
  hipertensao: "hyperextension",
  "extensao lombar": "back extension",
};

export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Translates known PT-BR gym terms inside a normalized name to English, leaving unknown words untouched. */
export function translateKnownTerms(normalizedName: string): string {
  if (EXERCISE_NAME_DICTIONARY[normalizedName]) {
    return EXERCISE_NAME_DICTIONARY[normalizedName];
  }

  const words = normalizedName.split(" ");
  const translatedWords = words.map((word) => EXERCISE_NAME_DICTIONARY[word] ?? word);
  return translatedWords.join(" ");
}
