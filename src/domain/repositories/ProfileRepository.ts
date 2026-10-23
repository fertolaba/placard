import type { Profile, ProfileData } from '../entities/Profile';

export interface ProfileRepository {
  get(): Promise<Profile>;
  save(data: ProfileData): Promise<Profile>;
}