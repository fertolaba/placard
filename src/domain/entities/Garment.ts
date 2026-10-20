export const GARMENT_CATEGORIES = ['arriba', 'abajo', 'calzado'] as const;
export type GarmentCategory = (typeof GARMENT_CATEGORIES)[number];

export interface Garment {
  id: string;
  name: string;
  category: GarmentCategory;
  colorHex: string; // formato #RRGGBB
  colorName: string;
  photoRef: string | null; // referencia de la foto en PhotoStorage (es lo que se guarda)
  imageUri: string | null; // dirección lista para mostrar la foto (se calcula desde photoRef)
  createdAt: Date;
}

/** Datos editables de una prenda (el id, la fecha y la dirección de la foto los resuelve el repositorio). */
export type NewGarment = Omit<Garment, 'id' | 'createdAt' | 'imageUri'>;