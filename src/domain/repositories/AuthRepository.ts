import { AuthUser, SignUpResult } from "../entities/AuthUser";

export interface AuthRepository {
  getCurrentUser(): Promise<AuthUser | null>;
  signUpWithEmail(email: string, password: string): Promise<SignUpResult>;
  signInWithEmail(email: string, password: string): Promise<AuthUser>;
  signInWithGoogle(): Promise<AuthUser>;
  signOut(): Promise<void>;
  /** Returns an unsubscribe function. */
  onAuthStateChange(listener: (user: AuthUser | null) => void): () => void;
}
