import { AuthUser } from "@domain/entities/AuthUser";
import { AuthRepository } from "@domain/repositories/AuthRepository";
import { SignInWithEmailInput, signInWithEmailSchema } from "../dtos/SignInWithEmail.dto";

export class SignInWithEmailUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(rawInput: SignInWithEmailInput): Promise<AuthUser> {
    const input = signInWithEmailSchema.parse(rawInput);
    return this.authRepository.signInWithEmail(input.email, input.password);
  }
}
