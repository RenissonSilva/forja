import { useCallback, useRef, useState } from "react";
import { WorkoutDay } from "@application/progress/GetWorkoutDay.usecase";
import { DateKey } from "@shared/date-utils";
import { useFocusEffect } from "expo-router";
import { useAppServices } from "../providers/AppServicesProvider";

/** Loads what was trained on `date`; stays idle while no day is selected. */
export function useWorkoutDay(profileId: string | undefined, date: DateKey | null) {
  const services = useAppServices();
  const [day, setDay] = useState<WorkoutDay | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Days can be tapped in quick succession — only the latest request may land.
  const latestRequest = useRef(0);

  const refresh = useCallback(async () => {
    if (!profileId || !date) return;
    const request = ++latestRequest.current;
    setIsLoading(true);
    const result = await services.progress.getWorkoutDay.execute({ profileId, date });
    if (request !== latestRequest.current) return;
    setDay(result);
    setIsLoading(false);
  }, [services, profileId, date]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return { day, isLoading, refresh };
}
