import { ExerciseDetails } from "@domain/entities/ExerciseDetails";
import { useAppServices } from "@presentation/providers/AppServicesProvider";
import { useEffect, useState } from "react";

type ExerciseDetailsStatus = "idle" | "loading" | "loaded" | "not-found" | "error";

interface ExerciseDetailsState {
  status: ExerciseDetailsStatus;
  details: ExerciseDetails | null;
}

export function useExerciseDetails(
  exerciseName: string,
  isCustom: boolean,
  enabled: boolean,
): ExerciseDetailsState {
  const services = useAppServices();
  const [state, setState] = useState<ExerciseDetailsState>({ status: "idle", details: null });

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function load() {
      setState({ status: "loading", details: null });
      try {
        const details = await services.exerciseInfo.getDetails.execute({
          exerciseName,
          isCustom,
        });
        if (cancelled) return;
        setState({ status: details ? "loaded" : "not-found", details });
      } catch {
        if (!cancelled) setState({ status: "error", details: null });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [services, exerciseName, isCustom, enabled]);

  return state;
}
