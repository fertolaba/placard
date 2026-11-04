import type { BodyZone } from '../../domain/entities/Garment';
import { STYLE_IDS } from '../../domain/entities/StyleReference';
import { GENERIC_SHAPES, silhouetteBox, silhouetteShape, STYLE_SHAPES } from './silhouetteShapes';

const ZONES: BodyZone[] = ['torso', 'piernas', 'pies'];

describe('silhouetteShape', () => {
  it.each(STYLE_IDS)('%s tiene silueta propia de arriba, abajo y calzado', (styleId) => {
    for (const zone of ZONES) {
      const { shape, generic } = silhouetteShape(zone, styleId);
      expect(generic).toBe(false);
      expect(shape).toBe(STYLE_SHAPES[styleId][zone]);
      expect(shape.main).not.toBe('');
    }
  });

  it('sin estilo usa la silueta genérica', () => {
    for (const zone of ZONES) {
      expect(silhouetteShape(zone)).toEqual({ shape: GENERIC_SHAPES[zone], generic: true });
      expect(silhouetteShape(zone, null).generic).toBe(true);
    }
  });

  it('los calzados son solo contorno', () => {
    for (const styleId of STYLE_IDS) expect(STYLE_SHAPES[styleId].pies.det).toBe('');
  });

  it('arriba y abajo ocupan el mismo cuadro que la genérica', () => {
    for (const styleId of STYLE_IDS) {
      for (const zone of ['torso', 'piernas'] as const) {
        expect(silhouetteBox(STYLE_SHAPES[styleId][zone], zone, 0.56)).toEqual(silhouetteBox(GENERIC_SHAPES[zone], zone, 0.56));
      }
    }
  });
});
