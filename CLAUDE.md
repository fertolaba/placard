@AGENTS.md

# Placard — guía para Claude Code

Proyecto personal de Fernando: placard de ropa digital. Expo SDK 58, React Native 0.88, TypeScript estricto, expo-router, clean architecture (domain/data/presentation/core), backend Supabase.

## Reglas fijas para TODAS las tareas
- Nunca abrir navegador ni levantar servidor. Correr solo `tsc`, lint y tests (`npx tsc --noEmit`, `npx expo lint`, `npm test`).
- Al final de cada tarea, dar una lista corta de prueba manual en español (vos, Fernando, la ejecutás a mano en el iPhone con Expo Go).
- El código va directo en el chat o se edita en el repo; nunca enviar zips.
- Todo lo que se desarrolle tiene que ser gratis (sin servicios pagos por uso).
- Nunca imprimir claves (Supabase, Gemini) en logs ni en el reporte.
- Las migraciones de Supabase se generan como SQL y se muestran completas en el reporte; NUNCA se ejecutan. Fernando las pega a mano en el SQL Editor.
- Nunca tocar `.env` / `.env.local` del usuario.
- Un dato nuevo en una prenda siempre es retrocompatible: las prendas viejas sin ese dato se tratan como neutras, nunca se excluyen por falta de datos.
- No dupliques un criterio de estilo/coherencia en dos lugares: toda regla de matching vive en el dominio compartido (styleCatalog / garmentFitsSlot / styleAffinity / outfitCoherence) y la consumen por igual GetStyleMatches, styleVariants y el mazo por color (SuggestOutfits).

## Mapa del proyecto
- Rutas (expo-router): `src/app/` — las pantallas reales están en `src/presentation/screens/`.
- Inyección de dependencias: `src/core/di/container.ts`; variables de entorno: `src/core/config/env.ts`.
- Catálogo y reglas de estilo: `src/domain/services/styleCatalog.ts` (entidad: `src/domain/entities/StyleReference.ts`).
- Elegibilidad compartida:
  - `src/domain/services/garmentFitsSlot.ts` (función `garmentFitsSlot`)
  - `src/domain/services/styleAffinity.ts` (afinidad, estilo "hogar", prenda principal: `affinity`, `homeStyle`, `principalScore`, `sortByPrincipal`)
  - `src/domain/usecases/GetStyleMatches.ts`
  - `src/presentation/outfits/styleVariants.ts` (ojo: está en presentation, pero solo debe consumir el dominio)
- Coherencia de outfits (color, formalidad, corte, estampado, pantalón×calzado):
  - `src/domain/services/outfitCoherence.ts` (`evaluateOutfitCoherence`, `garmentFormality`, `stylesOf`)
  - `src/domain/services/colorHarmony.ts` (`scoreOutfit`), `src/domain/services/outfitPalette.ts`, `src/domain/services/tone.ts`
  - `src/domain/services/bottomHem.ts` (relación botamanga del pantalón × calzado)
  - `src/domain/services/outfitExplanation.ts` (explicación y `echoBonus`)
  - Mazo por color: `src/domain/usecases/SuggestOutfits.ts` → `src/presentation/hooks/useOutfitSuggestions.ts` → `src/presentation/components/outfits/OutfitDeck.tsx`
- Siluetas por estilo: `src/presentation/components/outfits/GarmentSilhouettes.tsx` + formas en `src/presentation/outfits/silhouetteShapes.ts`.
- Tema / colores día-noche:
  - Tokens: `src/core/theme/palettes.ts` (`DAY_TOKENS`, `NIGHT_TOKENS`), `src/core/theme/seasonThemes.ts`
  - Providers y estilos: `src/presentation/theme/` (`ThemeProvider.tsx`, `SeasonThemeProvider.tsx`, `makeStyles.ts`; test guardián `noLegacyColors.test.ts`)
  - Outfits: `src/presentation/outfits/outfitsTheme.ts`, `src/presentation/outfits/styleGradients.ts`, `src/presentation/outfits/deckAppearance.ts`
- Cliente de Gemini / detección de prendas:
  - `src/data/ai/detectGarmentCategory.ts` (prompt, schema, reintentos, modelo de respaldo, `GeminiApiError`)
  - `src/data/ai/createGeminiCategoryDetector.ts`, `src/data/ai/createCategoryDetector(.native).ts`
  - Validación de la respuesta: `src/domain/services/garmentAnalysis.ts` (`parseGarmentAnalysis`)
  - Contrato y caso de uso: `src/domain/services/CategoryDetector.ts`, `src/domain/usecases/DetectGarmentCategory.ts`, hook `src/presentation/hooks/useCategoryDetection.ts`
- Repositorios y mappers de Supabase:
  - `src/data/supabase/supabaseClient.ts`, `src/data/supabase/SupabasePhotoStorage.ts`
  - `src/data/repositories/SupabaseGarmentRepository.ts`, `src/data/repositories/SupabaseAuthRepository.ts`
  - Mappers: `src/data/mappers/garmentMapper.ts` (API), `src/data/mappers/secondaryColors.ts`
  - Edge function: `supabase/functions/delete-account/index.ts`
- Migraciones SQL de Supabase: `supabase/migrations/` (formato `YYYYMMDDHHMMSS_descripcion.sql`).
- Base local SQLite (modo `sqlite`): `src/data/database/migrations.ts` (`LATEST_VERSION`) + `src/data/repositories/SqliteGarmentRepository.ts`. Un campo nuevo de prenda también necesita su bloque acá.

## Modelo de datos de Garment (`src/domain/entities/Garment.ts`)
- `name`, `category` (`arriba` | `top` | `abajo` | `pollera` | `calzado`), `corte?` (según `GARMENT_CUTS[category]`)
- `colorHex` / `colorName`, `secondaryColors` (hasta `MAX_SECONDARY_COLORS` = 3)
- `seasons` (al menos una)
- `classic`, `sporty` (booleanos)
- `calzadoTipo?` (`baja` | `gruesa` | `alta` | `botita`; solo calzado)
- `estampado?` (`liso` | `logo` | `grafico`)
- `formalidad?` (`clasico` | `casual` | `deportivo`, en `src/domain/entities/Formality.ts`; sin valor se deduce con `garmentFormality`)
- `photoRef` / `imageUri`, `id`, `createdAt`
- No existe un campo `tipo`: el tipo de prenda se infiere de `name` + `category` + `corte`.
