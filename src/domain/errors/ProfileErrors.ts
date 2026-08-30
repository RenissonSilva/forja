import { DomainError } from "./DomainError";

export class InvalidHeightError extends DomainError {
  readonly code = "INVALID_HEIGHT";
  constructor(heightCm: number) {
    super(`Altura inválida: ${heightCm}cm. Informe um valor entre 100 e 250 cm.`);
  }
}

export class InvalidWeightError extends DomainError {
  readonly code = "INVALID_WEIGHT";
  constructor(weightKg: number) {
    super(`Peso inválido: ${weightKg}kg. Informe um valor entre 20 e 400 kg.`);
  }
}

export class InvalidProfileNameError extends DomainError {
  readonly code = "INVALID_PROFILE_NAME";
  constructor() {
    super("Nome inválido. Informe entre 1 e 60 caracteres.");
  }
}

export class InvalidWeeklyGoalError extends DomainError {
  readonly code = "INVALID_WEEKLY_GOAL";
  constructor(days: number) {
    super(`Dias de treino por semana inválido: ${days}. Informe um valor entre 1 e 7.`);
  }
}

export class ProfileNotFoundError extends DomainError {
  readonly code = "PROFILE_NOT_FOUND";
  constructor() {
    super("Nenhum perfil encontrado. Complete o onboarding primeiro.");
  }
}
