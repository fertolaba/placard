import type { Referente } from '../../domain/entities/Referente';

// Los mismos hex de GARMENT_COLORS, para que las prendas clave hablen el idioma del placard.
const NEGRO = '#26262B';
const GRIS_OSCURO = '#55555B';
const GRIS = '#8E8E93';
const BLANCO = '#EDEAE4';
const CRUDO = '#E8DFCB';
const CAMEL = '#C19A6B';
const MARRON = '#7B5B3F';
const CELESTE = '#9CC3E6';
const DENIM = '#5B7AA0';
const MARINO = '#1F2F4F';
const VERDE = '#3E7B4F';
const ROSA = '#E3A1B5';
const FUCSIA = '#C2307A';
const ROJO = '#C0392B';
const AMARILLO = '#E5C24A';
const AZUL = '#2F5FA8';
const MENTA = '#A8D8C0';

/**
 * Textos orientativos: son una interpretación del estilo de cada persona, no información oficial.
 * La primera prenda "arriba" o "top" y la primera "abajo" o "pollera" son las que se dibujan en la ilustración.
 */
export const SAMPLE_REFERENTES: Referente[] = [
  // Revisado con sus fotos de assets/referencia/asap-rocky/ (Gemini no las analizó). Mismo id: no se duplica.
  {
    id: 'asap-rocky',
    nombre: 'A$AP Rocky',
    iniciales: 'AR',
    colorAvatar: ROJO,
    colorTarjeta: '#4A1F1E',
    estilo: 'Streetwear',
    etiquetas: ['Streetwear', 'Clásico', 'Capas'],
    resumen: 'Calle y sastrería: jeans amplios con piezas clásicas y de lujo',
    claves: [
      { titulo: 'Clásico mezclado con calle', descripcion: 'Camisa, chomba o piloto con un jean baggy.' },
      { titulo: 'Capas y siluetas amplias', descripcion: 'Arriba boxy u oversize, abajo jeans muy anchos.' },
      { titulo: 'Base oscura con acentos', descripcion: 'Negro, marino y denim con un toque de rojo o camel.' },
    ],
    paleta: [NEGRO, CELESTE, MARINO, ROJO],
    prendasClave: [
      { nombre: 'Campera de cuero negra', categoria: 'arriba', colorHex: NEGRO, corte: 'boxy' },
      { nombre: 'Jean celeste', categoria: 'abajo', colorHex: CELESTE, corte: 'baggy' },
      { nombre: 'Chomba rugby a rayas', categoria: 'arriba', colorHex: MARINO, corte: 'oversize' },
      { nombre: 'Cardigan gris', categoria: 'arriba', colorHex: GRIS_OSCURO, corte: 'oversize' },
      { nombre: 'Camisa blanca', categoria: 'arriba', colorHex: BLANCO, corte: 'regular' },
      { nombre: 'Jean gris', categoria: 'abajo', colorHex: GRIS, corte: 'baggy' },
      { nombre: 'Mocasines camel', categoria: 'calzado', colorHex: CAMEL },
      { nombre: 'Zapatillas negras', categoria: 'calzado', colorHex: NEGRO },
    ],
    destacado: true,
    gender: 'male',
  },
  {
    id: 'tyler-the-creator',
    nombre: 'Tyler, the Creator',
    iniciales: 'TC',
    colorAvatar: VERDE,
    colorTarjeta: '#27442F',
    estilo: 'Streetwear',
    etiquetas: ['Streetwear', 'Color', 'Preppy'],
    resumen: 'Colores vivos y sastrería con humor',
    claves: [
      { titulo: 'Color sin miedo', descripcion: 'Combinaciones vivas y poco habituales.' },
      { titulo: 'Preppy con vuelta de tuerca', descripcion: 'Prendas clásicas en colores inesperados.' },
      { titulo: 'Proporciones cortas y amplias', descripcion: 'Partes de arriba boxy con pantalón recto.' },
    ],
    paleta: [VERDE, AMARILLO, ROSA, CRUDO],
    prendasClave: [
      { nombre: 'Saco verde', categoria: 'arriba', colorHex: VERDE, corte: 'boxy' },
      { nombre: 'Pantalón crudo', categoria: 'abajo', colorHex: CRUDO, corte: 'straight' },
      { nombre: 'Sweater amarillo', categoria: 'arriba', colorHex: AMARILLO, corte: 'regular' },
      { nombre: 'Camisa rosa', categoria: 'arriba', colorHex: ROSA, corte: 'boxy' },
      { nombre: 'Mocasines marrones', categoria: 'calzado', colorHex: MARRON },
    ],
    destacado: false,
    gender: 'male',
  },
  // El id es el nombre de su carpeta en assets/referencia/. Textos orientativos, como los de los demás.
  {
    id: 'rauw',
    nombre: 'Rauw Alejandro',
    iniciales: 'RA',
    colorAvatar: FUCSIA,
    colorTarjeta: '#3A1530',
    estilo: 'Vanguardia',
    etiquetas: ['Vanguardia', 'Color', 'Lujo'],
    resumen: 'Futurista y atrevido: sastrería, cuero y color con mucha actitud',
    claves: [
      { titulo: 'Futurismo con actitud', descripcion: 'Siluetas y accesorios llamativos.' },
      { titulo: 'Cuero y texturas', descripcion: 'Cuero, brillos y materiales que se notan.' },
      { titulo: 'Color como acento', descripcion: 'Negro de base con fucsia o plateado.' },
    ],
    paleta: [NEGRO, FUCSIA, GRIS],
    prendasClave: [
      { nombre: 'Chaqueta negra', categoria: 'arriba', colorHex: NEGRO, corte: 'boxy' },
      { nombre: 'Pantalón negro', categoria: 'abajo', colorHex: NEGRO, corte: 'wide leg' },
      { nombre: 'Camisa fucsia', categoria: 'arriba', colorHex: FUCSIA, corte: 'regular' },
      { nombre: 'Jean gris', categoria: 'abajo', colorHex: GRIS, corte: 'baggy' },
      { nombre: 'Botas negras', categoria: 'calzado', colorHex: NEGRO },
      { nombre: 'Zapatillas blancas', categoria: 'calzado', colorHex: BLANCO },
    ],
    destacado: true,
    gender: 'male',
  },
  // Sin borrador de scripts/analyze-referentes.js: Gemini rechazó sus fotos. Textos escritos mirando assets/referencia/bad-bunny/.
  {
    id: 'bad-bunny',
    nombre: 'Bad Bunny',
    iniciales: 'BB',
    colorAvatar: ROSA,
    colorTarjeta: '#2B3A55',
    estilo: 'Streetwear',
    etiquetas: ['Streetwear', 'Y2K', 'Color'],
    resumen: 'Volúmenes amplios, jeans baggy y pasteles con un detalle que sorprende',
    claves: [
      { titulo: 'Arriba corto, abajo amplio', descripcion: 'Buzos boxy con jeans baggy o pantalones anchos.' },
      { titulo: 'Pasteles y crudos', descripcion: 'Crudo, rosa y celeste con un azul fuerte.' },
      { titulo: 'Un detalle inesperado', descripcion: 'Rayas, capas o un accesorio que rompe lo simple.' },
    ],
    paleta: [CRUDO, CELESTE, ROSA, AZUL],
    prendasClave: [
      { nombre: 'Buzo crudo', categoria: 'arriba', colorHex: CRUDO, corte: 'boxy' },
      { nombre: 'Jean celeste', categoria: 'abajo', colorHex: CELESTE, corte: 'baggy' },
      { nombre: 'Sweater a rayas azul', categoria: 'arriba', colorHex: AZUL, corte: 'oversize' },
      { nombre: 'Remera rosa', categoria: 'arriba', colorHex: ROSA, corte: 'oversize' },
      { nombre: 'Pantalón menta', categoria: 'abajo', colorHex: MENTA, corte: 'wide leg' },
      { nombre: 'Zapatillas blancas', categoria: 'calzado', colorHex: BLANCO },
    ],
    destacado: true,
    gender: 'male',
  },
  // Del borrador de scripts/analyze-referentes.js (confianza alta); el calzado se agregó mirando sus fotos.
  {
    id: 'central-cee',
    nombre: 'Central Cee',
    iniciales: 'CC',
    colorAvatar: GRIS,
    colorTarjeta: '#2A2A30',
    estilo: 'Streetwear',
    etiquetas: ['Streetwear', 'Oversize', 'Casual'],
    resumen: 'Estilo urbano y relajado con camperas y pantalones anchos',
    claves: [
      { titulo: 'Partes de arriba holgadas', descripcion: 'Buzos, camperas y camisas de corte oversize.' },
      { titulo: 'Pantalones amplios', descripcion: 'Jeans y joggers de cortes relajados y anchos.' },
      { titulo: 'Algo en la cabeza', descripcion: 'Gorro tipo beanie, pañuelo o gorra.' },
    ],
    paleta: [NEGRO, GRIS, BLANCO, DENIM],
    prendasClave: [
      { nombre: 'Campera deportiva negra', categoria: 'arriba', colorHex: NEGRO, corte: 'regular' },
      { nombre: 'Jean gris ancho', categoria: 'abajo', colorHex: GRIS, corte: 'baggy' },
      { nombre: 'Camisa a cuadros', categoria: 'arriba', colorHex: ROJO, corte: 'regular' },
      { nombre: 'Jean azul ancho', categoria: 'abajo', colorHex: DENIM, corte: 'baggy' },
      { nombre: 'Buzo con capucha azul', categoria: 'arriba', colorHex: AZUL, corte: 'oversize' },
      { nombre: 'Campera de jean', categoria: 'arriba', colorHex: DENIM, corte: 'regular' },
      { nombre: 'Calzado negro', categoria: 'calzado', colorHex: NEGRO },
    ],
    destacado: true,
    gender: 'male',
  },
  // Gemini no analizó sus fotos: textos escritos mirando assets/referencia/drake/.
  {
    id: 'drake',
    nombre: 'Drake',
    iniciales: 'D',
    colorAvatar: MARINO,
    colorTarjeta: '#1D2B45',
    estilo: 'Streetwear',
    etiquetas: ['Streetwear', 'Baggy', 'Lujo'],
    resumen: 'Jeans gastados y muy anchos con camperas de impacto',
    claves: [
      { titulo: 'Abajo bien amplio', descripcion: 'Jeans baggy gastados o rotos, siempre largos.' },
      { titulo: 'Una campera que manda', descripcion: 'Universitaria, de cuero o con capucha sobre algo simple.' },
      { titulo: 'Base clara y básica', descripcion: 'Remera o buzo crudo y zapatillas blancas.' },
    ],
    paleta: [MARINO, BLANCO, CELESTE, MARRON],
    prendasClave: [
      { nombre: 'Campera con capucha marino', categoria: 'arriba', colorHex: MARINO, corte: 'oversize' },
      { nombre: 'Jean celeste roto', categoria: 'abajo', colorHex: CELESTE, corte: 'baggy' },
      { nombre: 'Remera blanca', categoria: 'arriba', colorHex: BLANCO, corte: 'oversize' },
      { nombre: 'Buzo crudo', categoria: 'arriba', colorHex: CRUDO, corte: 'oversize' },
      { nombre: 'Campera de cuero marrón', categoria: 'arriba', colorHex: MARRON, corte: 'oversize' },
      { nombre: 'Jean azul oscuro', categoria: 'abajo', colorHex: MARINO, corte: 'baggy' },
      { nombre: 'Zapatillas blancas', categoria: 'calzado', colorHex: BLANCO },
    ],
    destacado: false,
    gender: 'male',
  },
];
