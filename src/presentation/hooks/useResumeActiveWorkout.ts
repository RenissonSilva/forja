import { router } from "expo-router";
import { useEffect } from "react";
import { resumableSession, useActiveWorkoutStore } from "../stores/activeWorkoutStore";
import { useProfile } from "./useProfile";

/**
 * Reopens the workout session that was in progress when the app was killed in
 * the background. Meant for the first screen mounted after the auth gate, so
 * the navigator is ready to push onto.
 */
export function useResumeActiveWorkout() {
  const { profile } = useProfile();

  useEffect(() => {
    const { session, clear } = useActiveWorkoutStore.getState();
    const resumable = resumableSession(session, profile?.id);
    if (!resumable) {
      if (session) clear();
      return;
    }
    router.push(`/treino/${resumable.fichaId}/sessao`);
    // Only on mount: this restores the launch state, it doesn't react to later changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
