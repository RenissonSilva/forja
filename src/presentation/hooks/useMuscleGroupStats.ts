import { useCallback, useState } from "react";
import { MuscleGroupStat } from "@application/attendance/GetMuscleGroupStats.usecase";
import { useFocusEffect } from "expo-router";
import { useAppServices } from "../providers/AppServicesProvider";

export function useMuscleGroupStats(profileId: string | undefined) {
  const services = useAppServices();
  const [stats, setStats] = useState<MuscleGroupStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!profileId) return;
    setIsLoading(true);
    const result = await services.attendance.getMuscleGroupStats.execute({ profileId });
    setStats(result);
    setIsLoading(false);
  }, [services, profileId]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return { stats, isLoading, refresh };
}
