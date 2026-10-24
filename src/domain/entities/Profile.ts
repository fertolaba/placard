export interface Profile {
  displayName: string;
  username: string; // sin @, en minúsculas
  showWatermark: boolean; // marca de Pilchapp al pie de las historias
  photoRef: string | null; // referencia de la foto de perfil en PhotoStorage (es lo que se guarda)
  photoUri: string | null; // dirección lista para mostrar la foto (se calcula desde photoRef)
}

/** Lo que se guarda del perfil (la dirección de la foto se calcula al leerlo). */
export type ProfileData = Omit<Profile, 'photoUri'>;

/** Lo que se edita en el formulario de texto del perfil. */
export type ProfileDraft = Pick<Profile, 'displayName' | 'username' | 'showWatermark'>;