import { MuscleGroup } from "@domain/entities/Exercise";
import { db } from "../database";
import { exercises } from "../schema";

interface SeedExercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
}

export const EXERCISE_CATALOG_SEED: SeedExercise[] = [
  { id: "peito-supino-reto", name: "Supino reto", muscleGroup: "peito" },
  {
    id: "peito-supino-inclinado-halteres",
    name: "Supino inclinado halteres",
    muscleGroup: "peito",
  },
  { id: "peito-crucifixo-maquina", name: "Crucifixo máquina", muscleGroup: "peito" },
  { id: "peito-supino-declinado", name: "Supino declinado", muscleGroup: "peito" },
  { id: "peito-crossover", name: "Crossover", muscleGroup: "peito" },
  { id: "costas-puxada-frente", name: "Puxada frente", muscleGroup: "costas" },
  { id: "costas-remada-baixa", name: "Remada baixa", muscleGroup: "costas" },
  { id: "costas-remada-curvada", name: "Remada curvada", muscleGroup: "costas" },
  { id: "costas-levantamento-terra", name: "Levantamento terra", muscleGroup: "costas" },
  { id: "costas-puxada-supinada", name: "Puxada supinada", muscleGroup: "costas" },
  { id: "perna-agachamento-livre", name: "Agachamento livre", muscleGroup: "perna" },
  { id: "perna-leg-press", name: "Leg press", muscleGroup: "perna" },
  { id: "perna-cadeira-extensora", name: "Cadeira extensora", muscleGroup: "perna" },
  { id: "perna-cadeira-flexora", name: "Cadeira flexora", muscleGroup: "perna" },
  { id: "perna-panturrilha-em-pe", name: "Panturrilha em pé", muscleGroup: "perna" },
  { id: "ombro-desenvolvimento-halteres", name: "Desenvolvimento halteres", muscleGroup: "ombro" },
  { id: "ombro-elevacao-lateral", name: "Elevação lateral", muscleGroup: "ombro" },
  { id: "ombro-elevacao-frontal", name: "Elevação frontal", muscleGroup: "ombro" },
  { id: "biceps-rosca-direta", name: "Rosca direta", muscleGroup: "biceps" },
  { id: "biceps-rosca-alternada", name: "Rosca alternada", muscleGroup: "biceps" },
  { id: "biceps-rosca-scott", name: "Rosca scott", muscleGroup: "biceps" },
  { id: "triceps-corda", name: "Tríceps corda", muscleGroup: "triceps" },
  { id: "triceps-testa", name: "Tríceps testa", muscleGroup: "triceps" },
  { id: "triceps-frances", name: "Tríceps francês", muscleGroup: "triceps" },
  { id: "core-abdominal-supra", name: "Abdominal supra", muscleGroup: "core" },
  { id: "core-prancha", name: "Prancha", muscleGroup: "core" },
  { id: "cardio-esteira", name: "Esteira", muscleGroup: "cardio" },
  { id: "cardio-bicicleta-ergometrica", name: "Bicicleta ergométrica", muscleGroup: "cardio" },
];

export async function seedExerciseCatalog(): Promise<void> {
  const now = new Date();
  await db
    .insert(exercises)
    .values(
      EXERCISE_CATALOG_SEED.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        isCustom: false,
        createdAt: now,
      })),
    )
    .onConflictDoNothing();
}
