import { AuthUser } from "@domain/entities/AuthUser";
import { AuthRepository } from "@domain/repositories/AuthRepository";

export class GetCurrentUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<AuthUser | null> {
    return this.authRepository.getCurrentUser();
  }
}
