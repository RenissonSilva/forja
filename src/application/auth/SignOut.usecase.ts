import { AuthRepository } from "@domain/repositories/AuthRepository";

export class SignOutUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<void> {
    return this.authRepository.signOut();
  }
}
