import { DomainError } from "./DomainError";

export class WeightEntryNotFoundError extends DomainError {
  readonly code = "WEIGHT_ENTRY_NOT_FOUND";
  constructor() {
    super("Nenhum registro de peso encontrado.");
  }
}
