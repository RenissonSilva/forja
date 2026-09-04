import { InMemoryAuthRepository } from "../testing/InMemoryAuthRepository";
import { GetCurrentUserUseCase } from "./GetCurrentUser.usecase";

describe("GetCurrentUserUseCase", () => {
  it("returns null when nobody is signed in", async () => {
    const authRepository = new InMemoryAuthRepository();
    const useCase = new GetCurrentUserUseCase(authRepository);

    expect(await useCase.execute()).toBeNull();
  });

  it("returns the currently signed in user", async () => {
    const authRepository = new InMemoryAuthRepository();
    const { user } = await authRepository.signUpWithEmail("rafael@example.com", "senha1234");
    const useCase = new GetCurrentUserUseCase(authRepository);

    expect(await useCase.execute()).toEqual(user);
  });
});
