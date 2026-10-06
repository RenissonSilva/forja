import { useCallback, useRef, useState } from "react";
import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { WorkoutPlanExercise, WorkoutSet } from "@domain/entities/WorkoutPlanExercise";
import { generateId } from "@shared/id";
import { useFocusEffect } from "expo-router";
import { useAppServices } from "../providers/AppServicesProvider";

interface AddExerciseInput {
  exerciseId: string;
  sets: WorkoutSet[];
  seatHeight?: number | null;
  seatDistance?: number | null;
  seatIncline?: number | null;
  seatLock?: number | null;
}

interface UpdateExerciseInput {
  sets?: WorkoutSet[];
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
  const enqueue = useCallback(<T>(task: () => Promise<T>): Promise<T> => {
    const result = queueRef.current.then(task, task);
    queueRef.current = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }, []);

  // Edits show up right away (optimistic), so quick taps on a stepper build on
  // each other instead of all starting from the last saved value. Only the
  // newest mutation's server result is applied — an older one would briefly
  // undo the edits still queued behind it. If the newest one fails, the plan is
  // reloaded so the screen doesn't keep showing a change that wasn't saved.
  const latestMutationRef = useRef(0);
  const mutate = useCallback(
    (
      task: (workoutPlanId: string) => Promise<WorkoutPlan>,
      optimistic?: (current: WorkoutPlan) => WorkoutPlan,
    ): Promise<void> => {
      if (!workoutPlanId) return Promise.resolve();
      if (optimistic) setPlan((current) => (current ? optimistic(current) : current));
      const mutationId = ++latestMutationRef.current;
      return enqueue(async () => {
        try {
          const updated = await task(workoutPlanId);
          if (mutationId === latestMutationRef.current) setPlan(updated);
        } catch (err: unknown) {
          if (mutationId === latestMutationRef.current) {
            const saved = await services.workoutPlans.get
              .execute({ workoutPlanId })
              .catch(() => null);
            if (saved && mutationId === latestMutationRef.current) setPlan(saved);
          }
          throw err;
        }
      });
    },
    [enqueue, services, workoutPlanId],
  );

  const addExercise = useCallback(
    (input: AddExerciseInput) => {
      // The id is picked here so the optimistic row and the saved one match, and
      // edits made to it before the save finishes reach the right exercise.
      const workoutPlanExerciseId = generateId();
      return mutate(
        (workoutPlanId) =>
          services.workoutPlans.addExercise.execute({
            workoutPlanId,
            workoutPlanExerciseId,
            ...input,
          }),
        (current) => withExerciseAdded(current, workoutPlanExerciseId, input),
      );
    },
    [mutate, services],
  );

  const updateExercise = useCallback(
    (workoutPlanExerciseId: string, input: UpdateExerciseInput) =>
      mutate(
        (workoutPlanId) =>
          services.workoutPlans.updateExercise.execute({
            workoutPlanId,
            workoutPlanExerciseId,
            ...input,
          }),
        (current) => withExerciseUpdate(current, workoutPlanExerciseId, input),
      ),
    [mutate, services],
  );

  const removeExercise = useCallback(
    (workoutPlanExerciseId: string) =>
      mutate(
        (workoutPlanId) =>
          services.workoutPlans.removeExercise.execute({ workoutPlanId, workoutPlanExerciseId }),
        (current) => current.removeExercise(workoutPlanExerciseId),
      ),
    [mutate, services],
  );

  const swapExercise = useCallback(
    (workoutPlanExerciseId: string, exerciseId: string, sets: WorkoutSet[]) =>
      mutate(
        (workoutPlanId) =>
          services.workoutPlans.swapExercise.execute({
            workoutPlanId,
            workoutPlanExerciseId,
            exerciseId,
            sets,
          }),
        (current) => withExerciseSwapped(current, workoutPlanExerciseId, exerciseId, sets),
      ),
    [mutate, services],
  );

  const reorderExercises = useCallback(
    (orderedWorkoutPlanExerciseIds: string[]) =>
      mutate(
        (workoutPlanId) =>
          services.workoutPlans.reorderExercises.execute({
            workoutPlanId,
            orderedWorkoutPlanExerciseIds,
          }),
        (current) => current.reorderExercises(orderedWorkoutPlanExerciseIds),
      ),
    [mutate, services],
  );

  const rename = useCallback(
    (name: string) =>
      mutate((workoutPlanId) => services.workoutPlans.update.execute({ workoutPlanId, name })),
    [mutate, services],
  );

  const remove = useCallback(() => {
    if (!workoutPlanId) return Promise.resolve();
    return enqueue(async () => {
      await services.workoutPlans.delete.execute({ workoutPlanId });
    });
  }, [enqueue, services, workoutPlanId]);

  return {
    plan,
    isLoading,
    refresh,
    addExercise,
    updateExercise,
    removeExercise,
    swapExercise,
    reorderExercises,
    rename,
    remove,
  };
}

/** Local preview of an added exercise; unchanged if the values don't pass validation. */
function withExerciseAdded(
  plan: WorkoutPlan,
  workoutPlanExerciseId: string,
  input: AddExerciseInput,
): WorkoutPlan {
  const added = WorkoutPlanExercise.create({
    id: workoutPlanExerciseId,
    exerciseId: input.exerciseId,
    order: 0,
    sets: input.sets,
    seatHeight: input.seatHeight ?? null,
    seatDistance: input.seatDistance ?? null,
    seatIncline: input.seatIncline ?? null,
    seatLock: input.seatLock ?? null,
  });
  return added.ok ? plan.addExercise(added.value) : plan;
}

/** Local preview of a swapped exercise; unchanged if the values don't pass validation. */
function withExerciseSwapped(
  plan: WorkoutPlan,
  workoutPlanExerciseId: string,
  exerciseId: string,
  sets: WorkoutSet[],
): WorkoutPlan {
  const current = plan.exercises.find((exercise) => exercise.id === workoutPlanExerciseId);
  if (!current) return plan;
  const swapped = WorkoutPlanExercise.create({
    ...current.toProps(),
    exerciseId,
    sets,
    seatHeight: null,
    seatDistance: null,
    seatIncline: null,
    seatLock: null,
  });
  if (!swapped.ok) return plan;
  const replaced = plan.replaceExercise(workoutPlanExerciseId, swapped.value);
  return replaced.ok ? replaced.value : plan;
}

/** Local preview of an exercise update; unchanged if the values don't pass validation. */
function withExerciseUpdate(
  plan: WorkoutPlan,
  workoutPlanExerciseId: string,
  input: UpdateExerciseInput,
): WorkoutPlan {
  const current = plan.exercises.find((exercise) => exercise.id === workoutPlanExerciseId);
  if (!current) return plan;
  const props = current.toProps();
  const updated = WorkoutPlanExercise.create({
    ...props,
    sets: input.sets ?? props.sets,
    seatHeight: input.seatHeight !== undefined ? input.seatHeight : props.seatHeight,
    seatDistance: input.seatDistance !== undefined ? input.seatDistance : props.seatDistance,
    seatIncline: input.seatIncline !== undefined ? input.seatIncline : props.seatIncline,
    seatLock: input.seatLock !== undefined ? input.seatLock : props.seatLock,
  });
  if (!updated.ok) return plan;
  const replaced = plan.replaceExercise(workoutPlanExerciseId, updated.value);
  return replaced.ok ? replaced.value : plan;
}
