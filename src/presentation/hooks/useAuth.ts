import { useCallback } from "react";
import { SignInWithEmailInput } from "@application/dtos/SignInWithEmail.dto";
import { SignUpWithEmailInput } from "@application/dtos/SignUpWithEmail.dto";
import { useAppServices } from "../providers/AppServicesProvider";
import { useAuthStore } from "../stores/authStore";

export function useAuth() {
  const services = useAppServices();
  const { user, isLoading, setUser } = useAuthStore();

  const signUp = useCallback(
    async (input: SignUpWithEmailInput) => {
      const result = await services.auth.signUp.execute(input);
      if (!result.requiresEmailConfirmation) {
        setUser(result.user);
      }
      return result;
    },
    [services, setUser],
  );

  const signIn = useCallback(
    async (input: SignInWithEmailInput) => {
      const signedInUser = await services.auth.signIn.execute(input);
      setUser(signedInUser);
      return signedInUser;
    },
    [services, setUser],
  );

  const signInWithGoogle = useCallback(async () => {
    const signedInUser = await services.auth.signInWithGoogle.execute();
    setUser(signedInUser);
    return signedInUser;
  }, [services, setUser]);

  const signOut = useCallback(async () => {
    await services.auth.signOut.execute();
    setUser(null);
  }, [services, setUser]);

  return { user, isLoading, signUp, signIn, signInWithGoogle, signOut };
}
