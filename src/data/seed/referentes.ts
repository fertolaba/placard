import type { Referente } from '../../domain/entities/Referente';

// Los mismos hex de GARMENT_COLORS, para que las prendas clave hablen el idioma del placard.
const NEGRO = '#26262B';
const GRIS_OSCURO = '#55555B';
const GRIS = '#8E8E93';
const BLANCO = '#EDEAE4';
const CRUDO = '#E8DFCB';
const BEIGE = '#CDB99A';
const CAMEL = '#C19A6B';
const MARRON = '#7B5B3F';
const CELESTE = '#9CC3E6';
const DENIM = '#5B7AA0';
const MARINO = '#1F2F4F';
const VERDE = '#3E7B4F';
const ROSA = '#E3A1B5';
const FUCSIA = '#C2307A';
const ROJO = '#C0392B';
const MOSTAZA = '#C99A2E';
const AMARILLO = '#E5C24A';
const LILA = '#B9A6D8';

/**
 * Textos orientativos: son una interpretación del estilo de cada persona, no información oficial.
 * La primera prenda "arriba" o "top" y la primera "abajo" o "pollera" son las que se dibujan en la ilustración.
 */
export const SAMPLE_REFERENTES: Referente[] = [
  {
    id: 'asap-rocky',
    nombre: 'A$AP Rocky',
    iniciales: 'AR',
    colorAvatar: ROJO,
    colorTarjeta: '#4A1F1E',
    estilo: 'Streetwear',
    etiquetas: ['Streetwear', 'Lujo', 'Capas'],
    resumen: 'Lujo y calle: capas, siluetas amplias y piezas de diseñador',
    claves: [
      { titulo: 'Lujo mezclado con calle', descripcion: 'Una pieza de diseñador con básicos simples.' },
      { titulo: 'Capas y siluetas amplias', descripcion: 'Cortes oversize, baggy y wide leg.' },
      { titulo: 'Paleta oscura con acentos', descripcion: 'Negro y gris, con un toque de rojo o crema.' },
    ],
    paleta: [NEGRO, ROJO, CRUDO],
    prendasClave: [
      { nombre: 'Remera roja', categoria: 'arriba', colorHex: ROJO, corte: 'oversize' },
      { nombre: 'Jogger negro', categoria: 'abajo', colorHex: NEGRO, corte: 'baggy' },
      { nombre: 'Buzo negro', categoria: 'arriba', colorHex: NEGRO, corte: 'oversize' },
      { nombre: 'Camisa crema', categoria: 'arriba', colorHex: CRUDO, corte: 'boxy' },
      { nombre: 'Jean gris', categoria: 'abajo', colorHex: GRIS, corte: 'wide leg' },
      { nombre: 'Zapatillas negras', categoria: 'calzado', colorHex: NEGRO },
      { nombre: 'Zapatillas blancas', categoria: 'calzado', colorHex: BLANCO },
    ],
    destacado: true,
  },
  {
    id: 'david-beckham',
    nombre: 'David Beckham',
    iniciales: 'DB',
    colorAvatar: MARINO,
    colorTarjeta: '#1D2B45',
    estilo: 'Clásico',
    etiquetas: ['Clásico', 'Sastrería', 'Prolijo'],
    resumen: 'Sastrería relajada y básicos impecables en tonos sobrios',
    claves: [
      { titulo: 'Sastrería sin rigidez', descripcion: 'Pantalones de vestir con prendas simples.' },
      { titulo: 'Básicos que calzan bien', descripcion: 'Pocas piezas, cortes regulares y prolijos.' },
      { titulo: 'Tonos sobrios', descripcion: 'Azul marino, camel y blanco como base.' },
    ],
    paleta: [MARINO, CAMEL, BLANCO],
    prendasClave: [
      { nombre: 'Camisa blanca', categoria: 'arriba', colorHex: BLANCO, corte: 'regular' },
      { nombre: 'Pantalón marino', categoria: 'abajo', colorHex: MARINO, corte: 'straight' },
      { nombre: 'Sweater azul marino', categoria: 'arriba', colorHex: MARINO, corte: 'regular' },
      { nombre: 'Saco camel', categoria: 'arriba', colorHex: CAMEL, corte: 'regular' },
      { nombre: 'Pantalón beige', categoria: 'abajo', colorHex: BEIGE, corte: 'slim' },
      { nombre: 'Zapatos marrones', categoria: 'calzado', colorHex: MARRON },
    ],
    destacado: true,
  },
  {
    id: 'hailey-bieber',
    nombre: 'Hailey Bieber',
    iniciales: 'HB',
    colorAvatar: CAMEL,
    colorTarjeta: '#4B3F33',
    estilo: 'Minimal',
    etiquetas: ['Minimal', 'Neutros', 'Relajado'],
    resumen: 'Básicos elevados y neutros, con una prenda oversize que manda',
    claves: [
      { titulo: 'Base minimalista', descripcion: 'Pocas prendas y sin estampas fuertes.' },
      { titulo: 'Contraste de volúmenes', descripcion: 'Algo ajustado con algo muy amplio.' },
      { titulo: 'Neutros cálidos', descripcion: 'Crudo, camel y negro combinados entre sí.' },
    ],
    paleta: [CRUDO, CAMEL, NEGRO],
    prendasClave: [
      { nombre: 'Top crudo', categoria: 'top', colorHex: CRUDO, corte: 'ajustado' },
      { nombre: 'Pantalón negro', categoria: 'abajo', colorHex: NEGRO, corte: 'wide leg' },
      { nombre: 'Campera camel', categoria: 'arriba', colorHex: CAMEL, corte: 'oversize' },
      { nombre: 'Jean celeste', categoria: 'abajo', colorHex: CELESTE, corte: 'straight' },
      { nombre: 'Calzado negro', categoria: 'calzado', colorHex: NEGRO },
    ],
    destacado: true,
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
  },
  {
    id: 'zendaya',
    nombre: 'Zendaya',
    iniciales: 'Z',
    colorAvatar: FUCSIA,
    colorTarjeta: '#512140',
    estilo: 'Minimal',
    etiquetas: ['Minimal', 'Elegante', 'Líneas limpias'],
    resumen: 'Líneas limpias y una sola prenda protagonista',
    claves: [
      { titulo: 'Una protagonista', descripcion: 'Una prenda fuerte y el resto en segundo plano.' },
      { titulo: 'Líneas limpias', descripcion: 'Siluetas alargadas y pocos detalles.' },
      { titulo: 'Color bien elegido', descripcion: 'Neutros con un solo color intenso.' },
    ],
    paleta: [FUCSIA, NEGRO, BLANCO],
    prendasClave: [
      { nombre: 'Top fucsia', categoria: 'top', colorHex: FUCSIA, corte: 'ajustado' },
      { nombre: 'Pantalón negro', categoria: 'abajo', colorHex: NEGRO, corte: 'wide leg' },
      { nombre: 'Camisa blanca', categoria: 'arriba', colorHex: BLANCO, corte: 'oversize' },
      { nombre: 'Pollera negra', categoria: 'pollera', colorHex: NEGRO, corte: 'lápiz' },
      { nombre: 'Calzado negro', categoria: 'calzado', colorHex: NEGRO },
    ],
    destacado: false,
  },
  {
    id: 'timothee-chalamet',
    nombre: 'Timothée Chalamet',
    iniciales: 'TC',
    colorAvatar: DENIM,
    colorTarjeta: '#2C3B4F',
    estilo: 'Clásico',
    etiquetas: ['Clásico', 'Relajado', 'Juvenil'],
    resumen: 'Clásicos relajados con un aire juvenil',
    claves: [
      { titulo: 'Clásico descontracturado', descripcion: 'Prendas formales usadas de forma simple.' },
      { titulo: 'Texturas suaves', descripcion: 'Sweaters y camisas de aspecto liviano.' },
      { titulo: 'Azules y neutros', descripcion: 'Denim, gris oscuro y crudo para todos los días.' },
    ],
    paleta: [DENIM, GRIS_OSCURO, CRUDO],
    prendasClave: [
      { nombre: 'Camisa denim', categoria: 'arriba', colorHex: DENIM, corte: 'regular' },
      { nombre: 'Pantalón gris oscuro', categoria: 'abajo', colorHex: GRIS_OSCURO, corte: 'straight' },
      { nombre: 'Sweater crudo', categoria: 'arriba', colorHex: CRUDO, corte: 'regular' },
      { nombre: 'Zapatillas blancas', categoria: 'calzado', colorHex: BLANCO },
    ],
    destacado: false,
  },
  {
    id: 'harry-styles',
    nombre: 'Harry Styles',
    iniciales: 'HS',
    colorAvatar: LILA,
    colorTarjeta: '#3D3355',
    estilo: 'Vanguardia',
    etiquetas: ['Vanguardia', 'Retro', 'Color'],
    resumen: 'Retro setentoso, color y prendas que juegan con lo clásico',
    claves: [
      { titulo: 'Aire setentoso', descripcion: 'Pantalones amplios y camisas llamativas.' },
      { titulo: 'Color y estampa', descripcion: 'Tonos pastel y mostaza sin miedo a mezclar.' },
      { titulo: 'Límites corridos', descripcion: 'Toma prendas de cualquier guardarropa.' },
    ],
    paleta: [LILA, MOSTAZA, CRUDO],
    prendasClave: [
      { nombre: 'Camisa lila', categoria: 'arriba', colorHex: LILA, corte: 'regular' },
      { nombre: 'Pantalón crudo', categoria: 'abajo', colorHex: CRUDO, corte: 'flared' },
      { nombre: 'Sweater mostaza', categoria: 'arriba', colorHex: MOSTAZA, corte: 'regular' },
      { nombre: 'Jean azul', categoria: 'abajo', colorHex: DENIM, corte: 'flared' },
      { nombre: 'Calzado blanco', categoria: 'calzado', colorHex: BLANCO },
    ],
    destacado: false,
  },
];
