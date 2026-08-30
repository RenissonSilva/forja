import { useCallback, useState } from "react";
import { BmiHistoryPoint } from "@application/progress/GetBmiHistory.usecase";
import { useFocusEffect } from "expo-router";
import { useAppServices } from "../providers/AppServicesProvider";

export function useBmiHistory(profileId: string | undefined) {
  const services = useAppServices();
  const [points, setPoints] = useState<BmiHistoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!profileId) return;
    setIsLoading(true);
    const result = await services.progress.getBmiHistory.execute({ profileId });
    setPoints(result);
    setIsLoading(false);
  }, [services, profileId]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return { points, isLoading, refresh };
}
