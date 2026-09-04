import { AuthUser } from "@domain/entities/AuthUser";
import { AuthRepository } from "@domain/repositories/AuthRepository";

export class SignInWithGoogleUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<AuthUser> {
    return this.authRepository.signInWithGoogle();
  }
}
