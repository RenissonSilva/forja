import { useCallback, useEffect } from "react";
import { CreateProfileInput } from "@application/dtos/CreateProfile.dto";
import { UpdateProfileInput } from "@application/dtos/UpdateProfile.dto";
import { useAppServices } from "../providers/AppServicesProvider";
import { useProfileStore } from "../stores/profileStore";

export function useProfile() {
  const services = useAppServices();
  const { profile, isLoading, hasLoaded, setProfile, setLoading } = useProfileStore();

  const refresh = useCallback(async () => {
    setLoading(true);
    const current = await services.profile.get.execute();
    setProfile(current);
  }, [services, setLoading, setProfile]);

  useEffect(() => {
    if (!hasLoaded) {
      refresh();
    }
  }, [hasLoaded, refresh]);

  const create = useCallback(
    async (input: CreateProfileInput) => {
      const created = await services.profile.create.execute(input);
      setProfile(created);
      return created;
    },
    [services, setProfile],
  );

  const update = useCallback(
    async (input: UpdateProfileInput) => {
      const updated = await services.profile.update.execute(input);
      setProfile(updated);
      return updated;
    },
    [services, setProfile],
  );

  return { profile, isLoading, refresh, create, update };
}
