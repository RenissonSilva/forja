import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { WorkoutSetValues } from "../components/features/WorkoutSetList";

/** A session older than this is treated as abandoned and not resumed. */
const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;

export interface ActiveWorkoutSession {
  fichaId: string;
  profileId: string;
  startedAt: number;
  completedIds: string[];
  sessionSets: Record<string, WorkoutSetValues[]>;
  /** Plan exercises left out of this session only (the plan keeps them). */
  removedIds?: string[];
  /** Exercises swapped for this session only: plan exercise id → exercise done instead. */
  exerciseOverrides?: Record<string, string>;
}

type SessionPatch = Partial<Omit<ActiveWorkoutSession, "fichaId" | "profileId" | "startedAt">>;

interface ActiveWorkoutState {
  session: ActiveWorkoutSession | null;
  hasHydrated: boolean;
  start: (fichaId: string, profileId: string) => void;
  update: (patch: SessionPatch | ((session: ActiveWorkoutSession) => SessionPatch)) => void;
  clear: () => void;
}

/**
 * The workout in progress, persisted so that when Android kills the app in the
 * background (screen off, switching apps) it reopens on the same session with
 * the sets and checkmarks the user had already filled in.
 */
export const useActiveWorkoutStore = create<ActiveWorkoutState>()(
  persist(
    (set) => ({
      session: null,
      hasHydrated: false,
      start: (fichaId, profileId) =>
        set({
          session: {
            fichaId,
            profileId,
            startedAt: Date.now(),
            completedIds: [],
            sessionSets: {},
            removedIds: [],
            exerciseOverrides: {},
          },
        }),
      update: (patch) =>
        set((state) => {
          if (!state.session) return state;
          const changes = typeof patch === "function" ? patch(state.session) : patch;
          return { session: { ...state.session, ...changes } };
        }),
      clear: () => set({ session: null }),
    }),
    {
      name: "forja.active-workout",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ session: state.session }),
      onRehydrateStorage: () => () => {
        useActiveWorkoutStore.setState({ hasHydrated: true });
      },
    },
  ),
);

export function resumableSession(
  session: ActiveWorkoutSession | null,
  profileId: string | undefined,
): ActiveWorkoutSession | null {
  if (!session || session.profileId !== profileId) return null;
  if (Date.now() - session.startedAt > SESSION_MAX_AGE_MS) return null;
  return session;
}
