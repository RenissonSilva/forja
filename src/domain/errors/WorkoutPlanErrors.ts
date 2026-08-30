import { DomainError } from "./DomainError";

export class InvalidWorkoutPlanNameError extends DomainError {
  readonly code = "INVALID_WORKOUT_PLAN_NAME";
  constructor() {
    super("Nome da ficha inválido. Informe entre 1 e 60 caracteres.");
  }
}

export class WorkoutPlanNotFoundError extends DomainError {
  readonly code = "WORKOUT_PLAN_NOT_FOUND";
  constructor(id: string) {
    super(`Ficha de treino não encontrada: ${id}.`);
  }
}

export class WorkoutPlanExerciseNotFoundError extends DomainError {
  readonly code = "WORKOUT_PLAN_EXERCISE_NOT_FOUND";
  constructor(id: string) {
    super(`Exercício não encontrado na ficha: ${id}.`);
  }
}

export class ExerciseNotFoundError extends DomainError {
  readonly code = "EXERCISE_NOT_FOUND";
  constructor(id: string) {
    super(`Exercício não encontrado no catálogo: ${id}.`);
  }
}

export class InvalidExerciseNameError extends DomainError {
  readonly code = "INVALID_EXERCISE_NAME";
  constructor() {
    super("Nome do exercício inválido. Informe entre 1 e 60 caracteres.");
  }
}

export class InvalidSetsError extends DomainError {
  readonly code = "INVALID_SETS";
  constructor(sets: number) {
    super(`Número de séries inválido: ${sets}. Informe um valor entre 1 e 20.`);
  }
}

export class InvalidRepsError extends DomainError {
  readonly code = "INVALID_REPS";
  constructor(reps: number) {
    super(`Número de repetições inválido: ${reps}. Informe um valor entre 1 e 100.`);
  }
}

export class InvalidLoadError extends DomainError {
  readonly code = "INVALID_LOAD";
  constructor(loadKg: number) {
    super(`Carga inválida: ${loadKg}kg. Informe um valor entre 0 e 500 kg.`);
  }
}
