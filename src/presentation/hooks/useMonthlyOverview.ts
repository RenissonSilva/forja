import { useCallback, useState } from "react";
import { MonthDayAttendanceSummary } from "@application/attendance/GetMonthlyAttendance.usecase";
import { MonthlyGoalProgress } from "@application/attendance/GetMonthlyGoalProgress.usecase";
import { addMonths, subMonths } from "date-fns";
import { useFocusEffect } from "expo-router";
import { useAppServices } from "../providers/AppServicesProvider";

export function useMonthlyOverview(profileId: string | undefined) {
  const services = useAppServices();
  const [referenceDate, setReferenceDate] = useState(() => new Date());
  const [days, setDays] = useState<MonthDayAttendanceSummary[]>([]);
  const [goalProgress, setGoalProgress] = useState<MonthlyGoalProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!profileId) return;
    setIsLoading(true);
    const [gridDays, progress] = await Promise.all([
      services.attendance.getMonthly.execute({ profileId, referenceDate }),
      services.attendance.getMonthlyGoalProgress.execute({ profileId, referenceDate }),
    ]);
    setDays(gridDays);
    setGoalProgress(progress);
    setIsLoading(false);
  }, [services, profileId, referenceDate]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const goToPreviousMonth = useCallback(() => setReferenceDate((prev) => subMonths(prev, 1)), []);
  const goToNextMonth = useCallback(() => setReferenceDate((prev) => addMonths(prev, 1)), []);

  return {
    referenceDate,
    days,
    goalProgress,
    isLoading,
    goToPreviousMonth,
    goToNextMonth,
    refresh,
  };
}
