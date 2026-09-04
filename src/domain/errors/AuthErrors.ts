import { DomainError } from "./DomainError";

export class InvalidCredentialsError extends DomainError {
  readonly code = "INVALID_CREDENTIALS";
  constructor() {
    super("E-mail ou senha incorretos.");
  }
}

export class EmailAlreadyInUseError extends DomainError {
  readonly code = "EMAIL_ALREADY_IN_USE";
  constructor() {
    super("Já existe uma conta com esse e-mail.");
  }
}

export class AuthRequestFailedError extends DomainError {
  readonly code = "AUTH_REQUEST_FAILED";
  constructor(message = "Não foi possível completar a autenticação. Tente novamente.") {
    super(message);
  }
}
