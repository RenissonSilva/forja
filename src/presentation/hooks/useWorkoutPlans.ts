import { useCallback, useState } from "react";
import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { useFocusEffect } from "expo-router";
import { useAppServices } from "../providers/AppServicesProvider";

export function useWorkoutPlans(profileId: string | undefined) {
  const services = useAppServices();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!profileId) return;
    setIsLoading(true);
    const result = await services.workoutPlans.list.execute({ profileId });
    setPlans(result);
    setIsLoading(false);
  }, [services, profileId]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const create = useCallback(
    async (name: string) => {
      if (!profileId) throw new Error("profileId é obrigatório");
      const created = await services.workoutPlans.create.execute({ profileId, name });
      await refresh();
      return created;
    },
    [services, profileId, refresh],
  );

  const remove = useCallback(
    async (workoutPlanId: string) => {
      await services.workoutPlans.delete.execute({ workoutPlanId });
      await refresh();
    },
    [services, refresh],
  );

  const markAsToday = useCallback(
    async (workoutPlanId: string) => {
      if (!profileId) return;
      await services.workoutPlans.markAsToday.execute({ profileId, workoutPlanId });
      await refresh();
    },
    [services, profileId, refresh],
  );

  return { plans, isLoading, refresh, create, remove, markAsToday };
}
