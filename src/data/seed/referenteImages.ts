// Generado por scripts/generate-referente-images.js: no editar a mano.
// Metro no admite rutas dinámicas, por eso cada require queda escrito.

/** Una foto lista para su cuadro: el recorte a medida o, si falta, la original con focus (centro de la cara, 0-1). */
export interface FotoEncuadrada {
  source: number;
  focus?: { x: number; y: number };
}

export interface ReferenteImages {
  /** avatar.* original. */
  portada?: number;
  /** Foto apaisada de la tarjeta de destacados. */
  card?: FotoEncuadrada;
  /** Avatar redondo. */
  avatar?: FotoEncuadrada;
  /** Originales, para verlos a pantalla completa. */
  looks: number[];
  /** Miniaturas del carrusel de looks, en el mismo orden que looks. */
  lookThumbs: FotoEncuadrada[];
}

export const REFERENTE_IMAGES: Record<string, ReferenteImages> = {
  'asap-rocky': {
    portada: require('../../../assets/referencia/asap-rocky/avatar.jpg'),
    card: { source: require('../../../assets/referencia/asap-rocky/crops/card.jpg') },
    avatar: { source: require('../../../assets/referencia/asap-rocky/crops/avatar.jpg') },
    looks: [
      require('../../../assets/referencia/asap-rocky/foto1.jpg'),
      require('../../../assets/referencia/asap-rocky/foto2.jpg'),
      require('../../../assets/referencia/asap-rocky/foto3.jpg'),
      require('../../../assets/referencia/asap-rocky/foto4.jpg'),
    ],
    lookThumbs: [
      { source: require('../../../assets/referencia/asap-rocky/crops/looks/foto1.jpg') },
      { source: require('../../../assets/referencia/asap-rocky/crops/looks/foto2.jpg') },
      { source: require('../../../assets/referencia/asap-rocky/crops/looks/foto3.jpg') },
      { source: require('../../../assets/referencia/asap-rocky/crops/looks/foto4.jpg') },
    ],
  },
  'bad-bunny': {
    portada: require('../../../assets/referencia/bad-bunny/avatar.jpg'),
    card: { source: require('../../../assets/referencia/bad-bunny/crops/card.jpg') },
    avatar: { source: require('../../../assets/referencia/bad-bunny/crops/avatar.jpg') },
    looks: [
      require('../../../assets/referencia/bad-bunny/foto1.jpg'),
      require('../../../assets/referencia/bad-bunny/foto2.jpg'),
      require('../../../assets/referencia/bad-bunny/foto3.jpg'),
      require('../../../assets/referencia/bad-bunny/foto4.jpg'),
      require('../../../assets/referencia/bad-bunny/foto5.jpg'),
    ],
    lookThumbs: [
      { source: require('../../../assets/referencia/bad-bunny/crops/looks/foto1.jpg') },
      { source: require('../../../assets/referencia/bad-bunny/crops/looks/foto2.jpg') },
      { source: require('../../../assets/referencia/bad-bunny/crops/looks/foto3.jpg') },
      { source: require('../../../assets/referencia/bad-bunny/crops/looks/foto4.jpg') },
      { source: require('../../../assets/referencia/bad-bunny/crops/looks/foto5.jpg') },
    ],
  },
  'central-cee': {
    portada: require('../../../assets/referencia/central-cee/avatar.jpg'),
    card: { source: require('../../../assets/referencia/central-cee/crops/card.jpg') },
    avatar: { source: require('../../../assets/referencia/central-cee/crops/avatar.jpg') },
    looks: [
      require('../../../assets/referencia/central-cee/foto1.jpg'),
      require('../../../assets/referencia/central-cee/foto2.jpg'),
      require('../../../assets/referencia/central-cee/foto3.jpg'),
      require('../../../assets/referencia/central-cee/foto4.jpg'),
      require('../../../assets/referencia/central-cee/foto5.jpg'),
    ],
    lookThumbs: [
      { source: require('../../../assets/referencia/central-cee/crops/looks/foto1.jpg') },
      { source: require('../../../assets/referencia/central-cee/crops/looks/foto2.jpg') },
      { source: require('../../../assets/referencia/central-cee/crops/looks/foto3.jpg') },
      { source: require('../../../assets/referencia/central-cee/crops/looks/foto4.jpg') },
      { source: require('../../../assets/referencia/central-cee/crops/looks/foto5.jpg') },
    ],
  },
  'drake': {
    looks: [
      require('../../../assets/referencia/drake/a0ec456656f52ccf681747d8f833fdb1.jpg'),
      require('../../../assets/referencia/drake/caa654af14aee29d85d9526360d0863b.jpg'),
      require('../../../assets/referencia/drake/d018bc3d5c5f84549a79812083bf9f36.jpg'),
      require('../../../assets/referencia/drake/e079d61d2fb2fa10a70c5e3a3d86173c.jpg'),
    ],
    lookThumbs: [
      { source: require('../../../assets/referencia/drake/crops/looks/a0ec456656f52ccf681747d8f833fdb1.jpg') },
      { source: require('../../../assets/referencia/drake/crops/looks/caa654af14aee29d85d9526360d0863b.jpg') },
      { source: require('../../../assets/referencia/drake/crops/looks/d018bc3d5c5f84549a79812083bf9f36.jpg') },
      { source: require('../../../assets/referencia/drake/crops/looks/e079d61d2fb2fa10a70c5e3a3d86173c.jpg') },
    ],
  },
  'rauw': {
    portada: require('../../../assets/referencia/rauw/avatar.jpg'),
    card: { source: require('../../../assets/referencia/rauw/crops/card.jpg') },
    avatar: { source: require('../../../assets/referencia/rauw/crops/avatar.jpg') },
    looks: [
      require('../../../assets/referencia/rauw/look-01.jpg'),
      require('../../../assets/referencia/rauw/look-02.jpg'),
      require('../../../assets/referencia/rauw/look-03.jpg'),
      require('../../../assets/referencia/rauw/look-04.jpg'),
      require('../../../assets/referencia/rauw/look-05.jpg'),
    ],
    lookThumbs: [
      { source: require('../../../assets/referencia/rauw/crops/looks/look-01.jpg') },
      { source: require('../../../assets/referencia/rauw/crops/looks/look-02.jpg') },
      { source: require('../../../assets/referencia/rauw/crops/looks/look-03.jpg') },
      { source: require('../../../assets/referencia/rauw/crops/looks/look-04.jpg') },
      { source: require('../../../assets/referencia/rauw/crops/looks/look-05.jpg') },
    ],
  },
  'tyler-the-creator': {
    portada: require('../../../assets/referencia/tyler-the-creator/avatar.jpg'),
    card: { source: require('../../../assets/referencia/tyler-the-creator/crops/card.jpg') },
    avatar: { source: require('../../../assets/referencia/tyler-the-creator/crops/avatar.jpg') },
    looks: [
      require('../../../assets/referencia/tyler-the-creator/look-01.jpg'),
      require('../../../assets/referencia/tyler-the-creator/look-02.jpg'),
      require('../../../assets/referencia/tyler-the-creator/look-03.jpg'),
      require('../../../assets/referencia/tyler-the-creator/look-04.jpg'),
    ],
    lookThumbs: [
      { source: require('../../../assets/referencia/tyler-the-creator/crops/looks/look-01.jpg') },
      { source: require('../../../assets/referencia/tyler-the-creator/crops/looks/look-02.jpg') },
      { source: require('../../../assets/referencia/tyler-the-creator/crops/looks/look-03.jpg') },
      { source: require('../../../assets/referencia/tyler-the-creator/crops/looks/look-04.jpg') },
    ],
  },
};
