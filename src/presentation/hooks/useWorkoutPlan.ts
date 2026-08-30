import { useCallback, useState } from "react";
import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { useFocusEffect } from "expo-router";
import { useAppServices } from "../providers/AppServicesProvider";

interface AddExerciseInput {
  exerciseId: string;
  sets: number;
  reps: number;
  loadKg: number;
  seatAdjustment?: string | null;
}

interface UpdateExerciseInput {
  sets?: number;
  reps?: number;
  loadKg?: number;
  seatAdjustment?: string | null;
}

export function useWorkoutPlan(workoutPlanId: string | undefined) {
  const services = useAppServices();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!workoutPlanId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const result = await services.workoutPlans.get.execute({ workoutPlanId });
    setPlan(result);
    setIsLoading(false);
  }, [services, workoutPlanId]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const addExercise = useCallback(
    async (input: AddExerciseInput) => {
      if (!workoutPlanId) return;
      const updated = await services.workoutPlans.addExercise.execute({
        workoutPlanId,
        ...input,
      });
      setPlan(updated);
    },
    [services, workoutPlanId],
  );

  const updateExercise = useCallback(
    async (workoutPlanExerciseId: string, input: UpdateExerciseInput) => {
      if (!workoutPlanId) return;
      const updated = await services.workoutPlans.updateExercise.execute({
        workoutPlanId,
        workoutPlanExerciseId,
        ...input,
      });
      setPlan(updated);
    },
    [services, workoutPlanId],
  );

  const removeExercise = useCallback(
    async (workoutPlanExerciseId: string) => {
      if (!workoutPlanId) return;
      const updated = await services.workoutPlans.removeExercise.execute({
        workoutPlanId,
        workoutPlanExerciseId,
      });
      setPlan(updated);
    },
    [services, workoutPlanId],
  );

  const rename = useCallback(
    async (name: string) => {
      if (!workoutPlanId) return;
      const updated = await services.workoutPlans.update.execute({ workoutPlanId, name });
      setPlan(updated);
    },
    [services, workoutPlanId],
  );

  const remove = useCallback(async () => {
    if (!workoutPlanId) return;
    await services.workoutPlans.delete.execute({ workoutPlanId });
  }, [services, workoutPlanId]);

  return { plan, isLoading, refresh, addExercise, updateExercise, removeExercise, rename, remove };
}
