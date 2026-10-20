import type { Profile } from '../../domain/entities/Profile';
import type { ProfileRepository } from '../../domain/repositories/ProfileRepository';

/** El perfil vive en memoria hasta que sumemos la base de datos. */
export class InMemoryProfileRepository implements ProfileRepository {
  private profile: Profile = { displayName: 'Tu nombre', username: 'tu.usuario', showWatermark: true };

  async get(): Promise<Profile> {
    return { ...this.profile };
  }

  async save(profile: Profile): Promise<Profile> {
    this.profile = { ...profile };
    return { ...this.profile };
  }
}