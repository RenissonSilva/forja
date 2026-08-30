import { useCallback, useState } from "react";
import { DayAttendanceSummary } from "@application/attendance/GetWeeklyAttendance.usecase";
import { useFocusEffect } from "expo-router";
import { useAppServices } from "../providers/AppServicesProvider";

export function useWeeklyAttendance(profileId: string | undefined) {
  const services = useAppServices();
  const [days, setDays] = useState<DayAttendanceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!profileId) return;
    setIsLoading(true);
    const result = await services.attendance.getWeekly.execute({ profileId });
    setDays(result);
    setIsLoading(false);
  }, [services, profileId]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return { days, isLoading, refresh };
}
