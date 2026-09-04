import { InMemoryAuthRepository } from "../testing/InMemoryAuthRepository";
import { SignUpWithEmailUseCase } from "./SignUpWithEmail.usecase";

function makeUseCase() {
  const authRepository = new InMemoryAuthRepository();
  const useCase = new SignUpWithEmailUseCase(authRepository);
  return { useCase, authRepository };
}

describe("SignUpWithEmailUseCase", () => {
  it("creates a new user and signs them in", async () => {
    const { useCase, authRepository } = makeUseCase();

    const result = await useCase.execute({ email: "Rafael@Example.com", password: "senha1234" });

    expect(result.user.email).toBe("rafael@example.com");
    expect(result.requiresEmailConfirmation).toBe(false);
    expect(await authRepository.getCurrentUser()).toEqual(result.user);
  });

  it("rejects a second sign up with the same e-mail", async () => {
    const { useCase } = makeUseCase();
    await useCase.execute({ email: "rafael@example.com", password: "senha1234" });

    await expect(
      useCase.execute({ email: "rafael@example.com", password: "outrasenha" }),
    ).rejects.toThrow();
  });

  it("rejects a password shorter than 8 characters before touching the repository", async () => {
    const { useCase, authRepository } = makeUseCase();

    await expect(useCase.execute({ email: "a@b.com", password: "short" })).rejects.toThrow();
    expect(await authRepository.getCurrentUser()).toBeNull();
  });
});
