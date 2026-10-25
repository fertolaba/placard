import { ApiGarmentRepository } from '../../data/repositories/ApiGarmentRepository';
import { InMemoryGarmentRepository } from '../../data/repositories/InMemoryGarmentRepository';
import { createSqliteGarmentRepository } from '../../data/repositories/createSqliteGarmentRepository';
import { AsyncStorageProfileRepository } from '../../data/repositories/AsyncStorageProfileRepository';
import { SupabaseAuthRepository } from '../../data/repositories/SupabaseAuthRepository';
import { SupabaseGarmentRepository } from '../../data/repositories/SupabaseGarmentRepository';
import { SupabasePhotoStorage } from '../../data/supabase/SupabasePhotoStorage';
import { UnconfiguredAuthRepository } from '../../data/repositories/UnconfiguredAuthRepository';
import { createSupabaseClient } from '../../data/supabase/supabaseClient';
import { AsyncStorageThemePreferenceRepository } from '@/domain/repositories/AsyncStorageThemePreferenceRepository';
import { createColorDetector } from '../../data/color/createColorDetector';
import { createPhotoStorage } from '../../data/photos/createPhotoStorage';
import { HttpClient } from '../../data/http/HttpClient';
import type { AuthRepository, CurrentUserId } from '../../domain/repositories/AuthRepository';
import type { GarmentRepository } from '../../domain/repositories/GarmentRepository';
import type { PhotoStorage } from '../../domain/services/PhotoStorage';
import type { SessionCache } from '../../domain/services/SessionCache';
import { AddGarment } from '../../domain/usecases/AddGarment';
import { AddGarmentWithPhoto } from '../../domain/usecases/AddGarmentWithPhoto';
import { ClearSessionData } from '../../domain/usecases/ClearSessionData';
import { DeleteGarment } from '../../domain/usecases/DeleteGarment';
import { DetectGarmentColor } from '../../domain/usecases/DetectGarmentColor';
import { GetGarment } from '../../domain/usecases/GetGarment';
import { GetGarments } from '../../domain/usecases/GetGarments';
import { GetProfile } from '../../domain/usecases/GetProfile';
import { GetSession } from '../../domain/usecases/GetSession';
import { GetStyleMatches } from '../../domain/usecases/GetStyleMatches';
import { GetThemeMode } from '../../domain/usecases/GetThemeMode';
import { GetWardrobeStats } from '../../domain/usecases/GetWardrobeStats';
import { SetProfilePhoto } from '../../domain/usecases/SetProfilePhoto';
import { SetThemeMode } from '../../domain/usecases/SetThemeMode';
import { SignIn } from '../../domain/usecases/SignIn';
import { SignOut } from '../../domain/usecases/SignOut';
import { SignUp } from '../../domain/usecases/SignUp';
import { SuggestOutfits } from '../../domain/usecases/SuggestOutfits';
import { createCategoryDetector } from '../../data/ai/createCategoryDetector';
import { DetectGarmentCategory } from '../../domain/usecases/DetectGarmentCategory';
import { UpdateGarment } from '../../domain/usecases/UpdateGarment';
import { UpdateProfile } from '../../domain/usecases/UpdateProfile';
import { env } from '../config/env';

/**
 * Único lugar donde se decide QUÉ implementación se usa.
 * Para sumar otra fuente de datos: crear su repositorio y agregar un caso acá.
 */
const localPhotoStorage = createPhotoStorage(); // fotos en el teléfono (la de perfil siempre; las de prendas si no se usa Supabase)
const colorDetector = createColorDetector();
const categoryDetector = createCategoryDetector(env.geminiApiKey);

// Cuentas: sin URL o clave de Supabase la app abre igual, pero no se puede entrar.
const supabase = createSupabaseClient(env.supabaseUrl, env.supabaseAnonKey);
const authRepository: AuthRepository = supabase ? new SupabaseAuthRepository(supabase) : new UnconfiguredAuthRepository();

/** El dueño de los datos: cada prenda y cada perfil se guardan y se leen con el id de la cuenta con sesión. */
const currentUserId: CurrentUserId = async () => {
  const user = await authRepository.getSession();
  if (!user) throw new Error('No hay una sesión iniciada.');
  return user.id;
};

// Lo que queda en memoria de la cuenta con sesión y hay que olvidar al cerrarla.
const sessionCaches: SessionCache[] = [];

function createGarmentStorage(): { repository: GarmentRepository; photos: PhotoStorage } {
  if (env.dataSource === 'supabase' && supabase) {
    const repository = new SupabaseGarmentRepository(supabase, currentUserId);
    sessionCaches.push(repository);
    return { repository, photos: new SupabasePhotoStorage(supabase, currentUserId) };
  }
  if (env.dataSource === 'api') return { repository: new ApiGarmentRepository(new HttpClient(env.apiUrl)), photos: localPhotoStorage };
  if (env.dataSource === 'sqlite') return { repository: createSqliteGarmentRepository(localPhotoStorage, currentUserId), photos: localPhotoStorage };
  return {
    repository: new InMemoryGarmentRepository(currentUserId, (ref) => localPhotoStorage.resolve(ref)),
    photos: localPhotoStorage,
  };
}

const { repository: garmentRepository, photos: photoStorage } = createGarmentStorage();
const profileRepository = new AsyncStorageProfileRepository((ref) => localPhotoStorage.resolve(ref), currentUserId);
const themePreferenceRepository = new AsyncStorageThemePreferenceRepository();
const addGarment = new AddGarment(garmentRepository);

export const container = {
  getGarments: new GetGarments(garmentRepository),
  getGarment: new GetGarment(garmentRepository),
  addGarment,
  addGarmentWithPhoto: new AddGarmentWithPhoto(addGarment, photoStorage),
  updateGarment: new UpdateGarment(garmentRepository, photoStorage),
  deleteGarment: new DeleteGarment(garmentRepository, photoStorage),
  detectGarmentColor: new DetectGarmentColor(colorDetector),
  detectGarmentCategory: new DetectGarmentCategory(categoryDetector),
  suggestOutfits: new SuggestOutfits(garmentRepository),
  getProfile: new GetProfile(profileRepository),
  updateProfile: new UpdateProfile(profileRepository),
  setProfilePhoto: new SetProfilePhoto(profileRepository, localPhotoStorage),
  getWardrobeStats: new GetWardrobeStats(garmentRepository),
  getStyleMatches: new GetStyleMatches(garmentRepository),
  getThemeMode: new GetThemeMode(themePreferenceRepository),
  setThemeMode: new SetThemeMode(themePreferenceRepository),
  authConfigured: supabase !== null,
  signUp: new SignUp(authRepository),
  signIn: new SignIn(authRepository),
  signOut: new SignOut(authRepository),
  getSession: new GetSession(authRepository),
  clearSessionData: new ClearSessionData(sessionCaches),
};