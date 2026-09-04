import { InMemoryAuthRepository } from "../testing/InMemoryAuthRepository";
import { SignOutUseCase } from "./SignOut.usecase";

describe("SignOutUseCase", () => {
  it("clears the current user", async () => {
    const authRepository = new InMemoryAuthRepository();
    await authRepository.signUpWithEmail("rafael@example.com", "senha1234");
    const useCase = new SignOutUseCase(authRepository);

    await useCase.execute();

    expect(await authRepository.getCurrentUser()).toBeNull();
  });
});
