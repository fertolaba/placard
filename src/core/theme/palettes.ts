export interface Palette {
  background: string; // fondo de las pantallas
  surface: string; // tarjetas y grupos
  text: string;
  textMuted: string;
  primary: string; // relleno de botones, barras e interruptores (con texto onPrimary encima)
  onPrimary: string;
  link: string; // azul para texto e íconos
  primaryFill: string; // fondo azul suave (botones tintados, avatar)
  fillMuted: string; // fondo gris de controles segmentados
  segmentSelected: string;
  successText: string;
  successFill: string;
  danger: string;
  swatchBorder: string; // borde fino de prendas y puntos de color
}

export const lightPalette: Palette = {
  background: '#F2F2F7',
  surface: '#FFFFFF',
  text: '#000000',
  textMuted: '#6C6C70',
  primary: '#005FCC',
  onPrimary: '#FFFFFF',
  link: '#005FCC',
  primaryFill: 'rgba(0,95,204,0.12)',
  fillMuted: 'rgba(118,118,128,0.12)',
  segmentSelected: '#FFFFFF',
  successText: '#1E7A35',
  successFill: 'rgba(52,199,89,0.15)',
  danger: '#D70015',
  swatchBorder: 'rgba(0,0,0,0.12)',
};

export const darkPalette: Palette = {
  background: '#000000',
  surface: '#1C1C1E',
  text: '#FFFFFF',
  textMuted: '#98989F',
  primary: '#0A6CE0',
  onPrimary: '#FFFFFF',
  link: '#5AA9FF',
  primaryFill: 'rgba(90,169,255,0.22)',
  fillMuted: 'rgba(118,118,128,0.24)',
  segmentSelected: '#636366',
  successText: '#32D74B',
  successFill: 'rgba(50,215,75,0.20)',
  danger: '#FF453A',
  swatchBorder: 'rgba(255,255,255,0.18)',
};