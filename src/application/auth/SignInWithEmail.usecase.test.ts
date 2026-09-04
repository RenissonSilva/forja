import { InMemoryAuthRepository } from "../testing/InMemoryAuthRepository";
import { SignInWithEmailUseCase } from "./SignInWithEmail.usecase";

function makeUseCase() {
  const authRepository = new InMemoryAuthRepository();
  const useCase = new SignInWithEmailUseCase(authRepository);
  return { useCase, authRepository };
}

describe("SignInWithEmailUseCase", () => {
  it("signs in a user with matching credentials", async () => {
    const { useCase, authRepository } = makeUseCase();
    await authRepository.signUpWithEmail("rafael@example.com", "senha1234");
    await authRepository.signOut();

    const user = await useCase.execute({ email: "rafael@example.com", password: "senha1234" });

    expect(user.email).toBe("rafael@example.com");
    expect(await authRepository.getCurrentUser()).toEqual(user);
  });

  it("rejects wrong credentials", async () => {
    const { useCase, authRepository } = makeUseCase();
    await authRepository.signUpWithEmail("rafael@example.com", "senha1234");
    await authRepository.signOut();

    await expect(
      useCase.execute({ email: "rafael@example.com", password: "errada" }),
    ).rejects.toThrow();
    expect(await authRepository.getCurrentUser()).toBeNull();
  });
});
