import { Profile } from "../entities/Profile";

export interface ProfileRepository {
  /** This is a single-user app: returns the one local profile, or null before onboarding. */
  findCurrent(): Promise<Profile | null>;
  save(profile: Profile): Promise<void>;
}
