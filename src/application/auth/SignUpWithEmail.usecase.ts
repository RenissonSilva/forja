import { SignUpResult } from "@domain/entities/AuthUser";
import { AuthRepository } from "@domain/repositories/AuthRepository";
import { SignUpWithEmailInput, signUpWithEmailSchema } from "../dtos/SignUpWithEmail.dto";

export class SignUpWithEmailUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(rawInput: SignUpWithEmailInput): Promise<SignUpResult> {
    const input = signUpWithEmailSchema.parse(rawInput);
    return this.authRepository.signUpWithEmail(input.email, input.password);
  }
}
