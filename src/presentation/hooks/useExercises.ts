import { useEffect, useState } from "react";
import { Exercise, MuscleGroup } from "@domain/entities/Exercise";
import { useAppServices } from "../providers/AppServicesProvider";

export function useExercises(query: string, muscleGroup?: MuscleGroup) {
  const services = useAppServices();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      const result = await services.exercises.list.execute({ query, muscleGroup });
      if (cancelled) return;
      setExercises(result);
      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [services, query, muscleGroup]);

  return { exercises, isLoading };
}
