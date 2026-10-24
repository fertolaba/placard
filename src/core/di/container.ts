import { ApiGarmentRepository } from '../../data/repositories/ApiGarmentRepository';
import { InMemoryGarmentRepository } from '../../data/repositories/InMemoryGarmentRepository';
import { createSqliteGarmentRepository } from '../../data/repositories/createSqliteGarmentRepository';
import { AsyncStorageProfileRepository } from '../../data/repositories/AsyncStorageProfileRepository';
import { SupabaseAuthRepository } from '../../data/repositories/SupabaseAuthRepository';
import { UnconfiguredAuthRepository } from '../../data/repositories/UnconfiguredAuthRepository';
import { createSupabaseClient } from '../../data/supabase/supabaseClient';
import { AsyncStorageThemePreferenceRepository } from '@/domain/repositories/AsyncStorageThemePreferenceRepository';
import { createColorDetector } from '../../data/color/createColorDetector';
import { createPhotoStorage } from '../../data/photos/createPhotoStorage';
import { HttpClient } from '../../data/http/HttpClient';
import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import type { GarmentRepository } from '../../domain/repositories/GarmentRepository';
import { AddGarment } from '../../domain/usecases/AddGarment';
import { AddGarmentWithPhoto } from '../../domain/usecases/AddGarmentWithPhoto';
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
const photoStorage = createPhotoStorage();
const colorDetector = createColorDetector();
const categoryDetector = createCategoryDetector(env.geminiApiKey);

function createGarmentRepository(): GarmentRepository {
  if (env.dataSource === 'api') return new ApiGarmentRepository(new HttpClient(env.apiUrl));
  if (env.dataSource === 'sqlite') return createSqliteGarmentRepository(photoStorage);
  return new InMemoryGarmentRepository((ref) => photoStorage.resolve(ref));
}

const garmentRepository = createGarmentRepository();
const profileRepository = new AsyncStorageProfileRepository((ref) => photoStorage.resolve(ref));
const themePreferenceRepository = new AsyncStorageThemePreferenceRepository();
const addGarment = new AddGarment(garmentRepository);

// Cuentas: sin URL o clave de Supabase la app abre igual, pero no se puede entrar.
const supabase = createSupabaseClient(env.supabaseUrl, env.supabaseAnonKey);
const authRepository: AuthRepository = supabase ? new SupabaseAuthRepository(supabase) : new UnconfiguredAuthRepository();

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
  setProfilePhoto: new SetProfilePhoto(profileRepository, photoStorage),
  getWardrobeStats: new GetWardrobeStats(garmentRepository),
  getStyleMatches: new GetStyleMatches(garmentRepository),
  getThemeMode: new GetThemeMode(themePreferenceRepository),
  setThemeMode: new SetThemeMode(themePreferenceRepository),
  authConfigured: supabase !== null,
  signUp: new SignUp(authRepository),
  signIn: new SignIn(authRepository),
  signOut: new SignOut(authRepository),
  getSession: new GetSession(authRepository),
};