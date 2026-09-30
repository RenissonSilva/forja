import { ExerciseInfoSummary } from "@domain/repositories/ExerciseInfoRepository";
import { matchExerciseName } from "@domain/services/matchExerciseName";
import { useAppServices } from "@presentation/providers/AppServicesProvider";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface ExerciseInfoIndexContextValue {
  isReady: boolean;
  hasMatch: (name: string) => boolean;
}

const ExerciseInfoIndexContext = createContext<ExerciseInfoIndexContextValue>({
  isReady: false,
  hasMatch: () => false,
});

export function ExerciseInfoIndexProvider({ children }: { children: React.ReactNode }) {
  const services = useAppServices();
  const [summaries, setSummaries] = useState<ExerciseInfoSummary[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    services.exerciseInfo.listIndex
      .execute()
      .then((data) => {
        if (cancelled) return;
        setSummaries(data);
        setIsReady(true);
      })
      .catch(() => {
        if (!cancelled) setIsReady(false);
      });

    return () => {
      cancelled = true;
    };
  }, [services]);

  const hasMatch = useCallback(
    (name: string) => isReady && matchExerciseName(name, summaries) !== null,
    [isReady, summaries],
  );

  return (
    <ExerciseInfoIndexContext.Provider value={{ isReady, hasMatch }}>
      {children}
    </ExerciseInfoIndexContext.Provider>
  );
}

export function useExerciseInfoIndex(): ExerciseInfoIndexContextValue {
  return useContext(ExerciseInfoIndexContext);
}
