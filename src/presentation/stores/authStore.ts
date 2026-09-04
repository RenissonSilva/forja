import { AuthUser } from "@domain/entities/AuthUser";
import { create } from "zustand";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  hasLoaded: boolean;
  setUser: (user: AuthUser | null) => void;
}

/** Shared across the app: the auth gate in app/_layout.tsx and every screen
 * that needs the current session all read from this single store. */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  hasLoaded: false,
  setUser: (user) => set({ user, isLoading: false, hasLoaded: true }),
}));
