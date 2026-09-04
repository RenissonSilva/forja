import { useCallback, useEffect } from "react";
import { CreateProfileInput } from "@application/dtos/CreateProfile.dto";
import { UpdateProfileInput } from "@application/dtos/UpdateProfile.dto";
import { useAppServices } from "../providers/AppServicesProvider";
import { useProfileStore } from "../stores/profileStore";
import { useAuth } from "./useAuth";

export function useProfile() {
  const services = useAppServices();
  const { user } = useAuth();
  const { profile, isLoading, hasLoaded, setProfile, setLoading, reset } = useProfileStore();

  const refresh = useCallback(async () => {
    setLoading(true);
    const current = await services.profile.get.execute();
    setProfile(current);
  }, [services, setLoading, setProfile]);

  useEffect(() => {
    if (!user) {
      reset();
      return;
    }
    if (!hasLoaded) {
      refresh();
    }
  }, [user, hasLoaded, refresh, reset]);

  const create = useCallback(
    async (input: CreateProfileInput) => {
      if (!user) throw new Error("Cannot create a profile without an authenticated user.");
      const created = await services.profile.create.execute(input, user.id);
      setProfile(created);
      return created;
    },
    [services, user, setProfile],
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
