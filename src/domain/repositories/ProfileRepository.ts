import type { Profile } from '../entities/Profile';

export interface ProfileRepository {
  get(): Promise<Profile>;
  save(profile: Profile): Promise<Profile>;
}