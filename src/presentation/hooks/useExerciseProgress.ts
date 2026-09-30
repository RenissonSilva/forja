import { useCallback, useState } from "react";
import { ExerciseProgressItem } from "@application/progress/GetExerciseProgress.usecase";
import { useFocusEffect } from "expo-router";
import { useAppServices } from "../providers/AppServicesProvider";

export function useExerciseProgress(profileId: string | undefined) {
  const services = useAppServices();
  const [items, setItems] = useState<ExerciseProgressItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!profileId) return;
    setIsLoading(true);
    const result = await services.progress.getExerciseProgress.execute({ profileId });
    setItems(result);
    setIsLoading(false);
  }, [services, profileId]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return { items, isLoading, refresh };
}
