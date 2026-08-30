import { Profile } from "@domain/entities/Profile";
import { ProfileRepository } from "@domain/repositories/ProfileRepository";

export class InMemoryProfileRepository implements ProfileRepository {
  private current: Profile | null = null;

  async findCurrent(): Promise<Profile | null> {
    return this.current;
  }

  async save(profile: Profile): Promise<void> {
    this.current = profile;
  }
}
