import { useCallback, useMemo, useState } from "react";
import {
  BodyMeasurement,
  MEASUREMENT_TYPES,
  MeasurementType,
} from "@domain/entities/BodyMeasurement";
import { RegisterMeasurementsInput } from "@application/dtos/RegisterMeasurements.dto";
import { useFocusEffect } from "expo-router";
import { useAppServices } from "../providers/AppServicesProvider";

export function useMeasurementsHistory(profileId: string | undefined) {
  const services = useAppServices();
  const [entries, setEntries] = useState<BodyMeasurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const latestByType = useMemo(() => {
    const result: Partial<Record<MeasurementType, BodyMeasurement>> = {};
    for (const type of MEASUREMENT_TYPES) {
      const forType = entries.filter((entry) => entry.type === type);
      const latest = forType[forType.length - 1];
      if (latest) result[type] = latest;
    }
    return result;
  }, [entries]);

  const refresh = useCallback(async () => {
    if (!profileId) return;
    setIsLoading(true);
    const result = await services.progress.getMeasurementsHistory.execute({ profileId });
    setEntries(result);
    setIsLoading(false);
  }, [services, profileId]);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const registerMeasurements = useCallback(
    async (values: RegisterMeasurementsInput["values"]) => {
      if (!profileId) return;
      await services.progress.registerMeasurements.execute({ profileId, values });
      await refresh();
    },
    [services, profileId, refresh],
  );

  return { entries, latestByType, isLoading, refresh, registerMeasurements };
}
