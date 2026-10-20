import type { Profile } from '../entities/Profile';
import type { ProfileRepository } from '../repositories/ProfileRepository';

export class GetProfile {
  constructor(private readonly repository: ProfileRepository) {}

  execute(): Promise<Profile> {
    return this.repository.get();
  }
}