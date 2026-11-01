import type { StyleId } from '../../domain/entities/StyleReference';

export const STYLE_GRADIENTS: Record<StyleId, { c1: string; c2: string }> = {
  streetwear: { c1: '#2F3036', c2: '#8B7B6B' },
  'old-money': { c1: '#B9893F', c2: '#EDE3D0' },
  y2k: { c1: '#E88FC0', c2: '#8FC3F0' },
  techwear: { c1: '#16171B', c2: '#585F4A' },
  blokecore: { c1: '#D5162E', c2: '#1F3A9E' },
};
