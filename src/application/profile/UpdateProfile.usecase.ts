import { Profile } from "@domain/entities/Profile";
import { ProfileNotFoundError } from "@domain/errors/ProfileErrors";
import { ProfileRepository } from "@domain/repositories/ProfileRepository";
import { UpdateProfileInput, updateProfileSchema } from "../dtos/UpdateProfile.dto";

export class UpdateProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute(rawInput: UpdateProfileInput): Promise<Profile> {
    const input = updateProfileSchema.parse(rawInput);

    const current = await this.profileRepository.findCurrent();
    if (!current) throw new ProfileNotFoundError();

    const updateResult = current.update(input);
    if (!updateResult.ok) throw updateResult.error;

    await this.profileRepository.save(updateResult.value);
    return updateResult.value;
  }
}
