import { useCallback, useState } from "react";
import { ExerciseLog } from "@domain/entities/ExerciseLog";
import { useFocusEffect } from "expo-router";
import { useAppServices } from "../providers/AppServicesProvider";

export function useExercisePerformanceHistory(profileId: string | undefined) {
  const services = useAppServices();
  const [entries, setEntries] = useState<ExerciseLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!profileId) return;
    setIsLoading(true);
    const result = await services.progress.getExercisePerformanceHistory.execute({ profileId });
    setEntries(result);
    setIsLoading(false);
  }, [services, profileId]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return { entries, isLoading, refresh };
}
