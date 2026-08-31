import { useCallback, useRef, useState } from "react";
import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { useFocusEffect } from "expo-router";
import { useAppServices } from "../providers/AppServicesProvider";

interface AddExerciseInput {
  exerciseId: string;
  sets: number;
  reps: number;
  loadKg: number;
  seatHeight?: number | null;
  seatDistance?: number | null;
  seatIncline?: number | null;
  seatLock?: number | null;
}

interface UpdateExerciseInput {
  sets?: number;
  reps?: number;
  loadKg?: number;
  seatHeight?: number | null;
  seatDistance?: number | null;
  seatIncline?: number | null;
  seatLock?: number | null;
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

  // Every mutation here does a read-modify-write against the same plan row
  // (fetch, patch, delete+reinsert exercises). Firing several in a row without
  // waiting (e.g. typing across multiple seat-adjustment fields) lets a later
  // request read the row before an earlier one's write has landed, silently
  // reverting it. Chaining them through this queue forces strict ordering so
  // each call only starts once the previous one has fully committed.
  const queueRef = useRef<Promise<unknown>>(Promise.resolve());
  const enqueue = useCallback(<T,>(task: () => Promise<T>): Promise<T> => {
    const result = queueRef.current.then(task, task);
    queueRef.current = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }, []);

  const addExercise = useCallback(
    (input: AddExerciseInput) => {
      if (!workoutPlanId) return Promise.resolve();
      return enqueue(async () => {
        const updated = await services.workoutPlans.addExercise.execute({
          workoutPlanId,
          ...input,
        });
        setPlan(updated);
      });
    },
    [enqueue, services, workoutPlanId],
  );

  const updateExercise = useCallback(
    (workoutPlanExerciseId: string, input: UpdateExerciseInput) => {
      if (!workoutPlanId) return Promise.resolve();
      return enqueue(async () => {
        const updated = await services.workoutPlans.updateExercise.execute({
          workoutPlanId,
          workoutPlanExerciseId,
          ...input,
        });
        setPlan(updated);
      });
    },
    [enqueue, services, workoutPlanId],
  );

  const removeExercise = useCallback(
    (workoutPlanExerciseId: string) => {
      if (!workoutPlanId) return Promise.resolve();
      return enqueue(async () => {
        const updated = await services.workoutPlans.removeExercise.execute({
          workoutPlanId,
          workoutPlanExerciseId,
        });
        setPlan(updated);
      });
    },
    [enqueue, services, workoutPlanId],
  );

  const rename = useCallback(
    (name: string) => {
      if (!workoutPlanId) return Promise.resolve();
      return enqueue(async () => {
        const updated = await services.workoutPlans.update.execute({ workoutPlanId, name });
        setPlan(updated);
      });
    },
    [enqueue, services, workoutPlanId],
  );

  const remove = useCallback(() => {
    if (!workoutPlanId) return Promise.resolve();
    return enqueue(async () => {
      await services.workoutPlans.delete.execute({ workoutPlanId });
    });
  }, [enqueue, services, workoutPlanId]);

  return { plan, isLoading, refresh, addExercise, updateExercise, removeExercise, rename, remove };
}
