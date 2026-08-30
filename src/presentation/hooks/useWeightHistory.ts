import { useCallback, useState } from "react";
import { WeightEntry } from "@domain/entities/WeightEntry";
import { useFocusEffect } from "expo-router";
import { useAppServices } from "../providers/AppServicesProvider";

export function useWeightHistory(profileId: string | undefined) {
  const services = useAppServices();
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!profileId) return;
    setIsLoading(true);
    const result = await services.progress.getWeightHistory.execute({ profileId });
    setEntries(result);
    setIsLoading(false);
  }, [services, profileId]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const registerWeight = useCallback(
    async (weightKg: number) => {
      if (!profileId) return;
      await services.progress.registerWeight.execute({ profileId, weightKg });
      await refresh();
    },
    [services, profileId, refresh],
  );

  return { entries, isLoading, refresh, registerWeight };
}
