import { AuthUser, SignUpResult } from "@domain/entities/AuthUser";
import { AuthRepository } from "@domain/repositories/AuthRepository";
import { EmailAlreadyInUseError, InvalidCredentialsError } from "@domain/errors/AuthErrors";
import { generateId } from "@shared/id";

interface StoredUser {
  id: string;
  email: string;
  password: string;
}

export class InMemoryAuthRepository implements AuthRepository {
  private users: StoredUser[] = [];
  private current: AuthUser | null = null;
  private listeners: ((user: AuthUser | null) => void)[] = [];

  async getCurrentUser(): Promise<AuthUser | null> {
    return this.current;
  }

  async signUpWithEmail(email: string, password: string): Promise<SignUpResult> {
    if (this.users.some((user) => user.email === email)) {
      throw new EmailAlreadyInUseError();
    }
    const stored: StoredUser = { id: generateId(), email, password };
    this.users.push(stored);
    const user = this.setCurrent({ id: stored.id, email: stored.email });
    return { user, requiresEmailConfirmation: false };
  }

  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    const stored = this.users.find((user) => user.email === email && user.password === password);
    if (!stored) throw new InvalidCredentialsError();
    return this.setCurrent({ id: stored.id, email: stored.email });
  }

  async signInWithGoogle(): Promise<AuthUser> {
    return this.setCurrent({ id: generateId(), email: "google-user@example.com" });
  }

  async signOut(): Promise<void> {
    this.setCurrent(null);
  }

  onAuthStateChange(listener: (user: AuthUser | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((registered) => registered !== listener);
    };
  }

  private setCurrent(user: AuthUser | null): AuthUser {
    this.current = user;
    this.listeners.forEach((listener) => listener(user));
    return user as AuthUser;
  }
}
