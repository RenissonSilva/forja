import { Profile } from "@domain/entities/Profile";
import { ProfileRepository } from "@domain/repositories/ProfileRepository";

export class GetProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute(): Promise<Profile | null> {
    return this.profileRepository.findCurrent();
  }
}
