import { ApiGarmentRepository } from '../../data/repositories/ApiGarmentRepository';
import { InMemoryGarmentRepository } from '../../data/repositories/InMemoryGarmentRepository';
import { createSqliteGarmentRepository } from '../../data/repositories/createSqliteGarmentRepository';
import { InMemoryProfileRepository } from '../../data/repositories/InMemoryProfileRepository';
import { AsyncStorageThemePreferenceRepository } from '@/domain/repositories/AsyncStorageThemePreferenceRepository';
import { createPhotoStorage } from '../../data/photos/createPhotoStorage';
import { HttpClient } from '../../data/http/HttpClient';
import type { GarmentRepository } from '../../domain/repositories/GarmentRepository';
import { AddGarment } from '../../domain/usecases/AddGarment';
import { AddGarmentWithPhoto } from '../../domain/usecases/AddGarmentWithPhoto';
import { DetectGarmentColor } from '../../domain/usecases/DetectGarmentColor';
import { DeleteGarment } from '../../domain/usecases/DeleteGarment';
import { GetGarment } from '../../domain/usecases/GetGarment';
import { GetGarments } from '../../domain/usecases/GetGarments';
import { GetProfile } from '../../domain/usecases/GetProfile';
import { GetStyleMatches } from '../../domain/usecases/GetStyleMatches';
import { GetThemeMode } from '../../domain/usecases/GetThemeMode';
import { GetWardrobeStats } from '../../domain/usecases/GetWardrobeStats';
import { SetThemeMode } from '../../domain/usecases/SetThemeMode';
import { SuggestOutfits } from '../../domain/usecases/SuggestOutfits';
import { UpdateGarment } from '../../domain/usecases/UpdateGarment';
import { UpdateProfile } from '../../domain/usecases/UpdateProfile';
import { createColorDetector } from '../../data/color/createColorDetector';
import { env } from '../config/env';

/**
 * Único lugar donde se decide QUÉ implementación se usa.
 * Para sumar otra fuente de datos: crear su repositorio y agregar un caso acá.
 */
const photoStorage = createPhotoStorage();
const colorDetector = createColorDetector();

function createGarmentRepository(): GarmentRepository {
  if (env.dataSource === 'api') return new ApiGarmentRepository(new HttpClient(env.apiUrl));
  if (env.dataSource === 'sqlite') return createSqliteGarmentRepository(photoStorage);
  return new InMemoryGarmentRepository((ref) => photoStorage.resolve(ref));
}

const garmentRepository = createGarmentRepository();
const profileRepository = new InMemoryProfileRepository();
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
  suggestOutfits: new SuggestOutfits(garmentRepository),
  getProfile: new GetProfile(profileRepository),
  updateProfile: new UpdateProfile(profileRepository),
  getWardrobeStats: new GetWardrobeStats(garmentRepository),
  getStyleMatches: new GetStyleMatches(garmentRepository),
  getThemeMode: new GetThemeMode(themePreferenceRepository),
  setThemeMode: new SetThemeMode(themePreferenceRepository),
};