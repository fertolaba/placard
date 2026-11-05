import type { Formalidad } from './Formality';
import type { Garment, GarmentCategory } from './Garment';
import type { StyleId } from './StyleReference';

export const ESTILOS_REFERENTE = ['Streetwear', 'Clásico', 'Minimal', 'Vanguardia'] as const;
export type EstiloReferente = (typeof ESTILOS_REFERENTE)[number];

/** Qué estilo de Outfits se preselecciona desde cada referente. Minimal todavía no tiene un equivalente en el catálogo. */
export const ESTILO_OUTFIT: Partial<Record<EstiloReferente, StyleId>> = {
  Streetwear: 'streetwear',
  Clásico: 'old-money',
  Vanguardia: 'techwear',
};

/** A qué perfil se muestra un referente: 'unisex' (o sin dato) se muestra a todos. Ver referentesParaPerfil. */
export const GENEROS_REFERENTE = ['male', 'female', 'unisex'] as const;
export type GeneroReferente = (typeof GENEROS_REFERENTE)[number];

/**
 * Cuánta estampa admite el estilo del referente: 'solo-liso' (descarta estampas grandes y relega los logos),
 * 'logo-ok' (descarta estampas grandes) o 'grafico-ok' (todo vale). Ver referenteFit.
 */
export const TOLERANCIAS_GRAFICAS = ['solo-liso', 'logo-ok', 'grafico-ok'] as const;
export type ToleranciaGrafica = (typeof TOLERANCIAS_GRAFICAS)[number];

export interface ClaveDeEstilo {
  titulo: string;
  descripcion: string;
}

/** Una prenda del look del referente. El corte es informativo: no cuenta para el match. */
export interface PrendaClave {
  nombre: string;
  categoria: GarmentCategory;
  colorHex: string; // formato #RRGGBB
  corte?: string;
}

export interface Referente {
  id: string;
  nombre: string;
  iniciales: string;
  colorAvatar: string;
  colorTarjeta: string; // fondo de su tarjeta en el carrusel de destacados
  estilo: EstiloReferente;
  etiquetas: string[]; // las que se muestran en el detalle
  resumen: string;
  claves: ClaveDeEstilo[];
  paleta: string[]; // 3 o 4 colores (#RRGGBB)
  prendasClave: PrendaClave[];
  destacado: boolean;
  gender?: GeneroReferente;
  /** Formalidad que predomina en sus fotos. Sin dato = no filtra por formalidad. */
  formality?: Formalidad;
  /** Rango admitido, de lo más formal a lo más deportivo. Sin rango: un nivel para cada lado del predominante. */
  formalityRange?: readonly [Formalidad, Formalidad];
  /** Tolerancia a estampas. Sin dato = no filtra por estampado. */
  graphics?: ToleranciaGrafica;
}

/** Cuánto del look del referente se puede armar con el placard. */
export interface MatchReferente {
  tengo: number;
  total: number;
  porcentaje: number; // 0 a 100
  encontradas: { prenda: PrendaClave; garment: Garment }[];
  faltantes: PrendaClave[];
}
