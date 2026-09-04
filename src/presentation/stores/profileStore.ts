import { Profile } from "@domain/entities/Profile";
import { create } from "zustand";

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  hasLoaded: boolean;
  setProfile: (profile: Profile | null) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

/** Shared across the app: the onboarding gate in app/_layout.tsx and every
 * screen that needs the current profile all read from this single store. */
export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: true,
  hasLoaded: false,
  setProfile: (profile) => set({ profile, isLoading: false, hasLoaded: true }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ profile: null, isLoading: true, hasLoaded: false }),
}));
