import type { Profile, ProfileDraft } from '../entities/Profile';
import type { ProfileRepository } from '../repositories/ProfileRepository';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ValidationError.prototype); // para que instanceof funcione en React Native
    this.name = 'ValidationError';
  }
}

const USERNAME = /^[a-z0-9._]{3,20}$/;

export class UpdateProfile {
  constructor(private readonly repository: ProfileRepository) {}

  /** Cambia el nombre, el usuario y la marca de agua. La foto de perfil se mantiene como estaba. */
  async execute(input: ProfileDraft): Promise<Profile> {
    const displayName = input.displayName.trim();
    const username = input.username.trim().replace(/^@/, '').toLowerCase();
    if (displayName === '' || displayName.length > 40) {
      throw new ValidationError('El nombre tiene que tener entre 1 y 40 caracteres.');
    }
    if (!USERNAME.test(username)) {
      throw new ValidationError('El usuario tiene de 3 a 20 caracteres: letras, números, punto o guion bajo.');
    }
    const current = await this.repository.get();
    return this.repository.save({
      displayName,
      username,
      showWatermark: input.showWatermark,
      photoRef: current.photoRef,
    });
  }
}