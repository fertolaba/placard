import type { Profile, ProfileData } from '../entities/Profile';
import type { ProfileRepository } from '../repositories/ProfileRepository';
import type { PhotoStorage } from '../services/PhotoStorage';

function toData(profile: Profile): ProfileData {
  return {
    displayName: profile.displayName,
    username: profile.username,
    showWatermark: profile.showWatermark,
    photoRef: profile.photoRef,
  };
}

export class SetProfilePhoto {
  constructor(
    private readonly repository: ProfileRepository,
    private readonly photos: PhotoStorage,
  ) {}

  /** Cambia la foto de perfil por la que está en sourceUri; con null, la quita. */
  async execute(sourceUri: string | null): Promise<Profile> {
    const current = await this.repository.get();

    if (sourceUri === null) {
      if (current.photoRef === null) return current;
      const updated = await this.repository.save({ ...toData(current), photoRef: null });
      await this.photos.remove(current.photoRef).catch(() => undefined);
      return updated;
    }

    const newRef = await this.photos.save(sourceUri);
    try {
      const updated = await this.repository.save({ ...toData(current), photoRef: newRef });
      if (current.photoRef !== null && current.photoRef !== newRef) {
        await this.photos.remove(current.photoRef).catch(() => undefined); // la foto vieja ya no se usa
      }
      return updated;
    } catch (error) {
      await this.photos.remove(newRef).catch(() => undefined); // no dejar la foto nueva huérfana
      throw error;
    }
  }
}