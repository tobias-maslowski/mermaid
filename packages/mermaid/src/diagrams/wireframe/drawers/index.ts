import type { PrimitiveDrawer } from './types.js';
import { SvgDrawer } from './svgDrawer.js';
import { RoughDrawer, type RoughProfile } from './roughDrawer.js';

export * from './types.js';
export * from './svgDrawer.js';
export * from './roughDrawer.js';

export interface DrawerConfig {
  look?: string;
  handDrawnSeed?: number;
  handDrawnProfile?: RoughProfile;
  roughness?: number;
  bowing?: number;
  disableMultiStroke?: boolean;
  themeVariables?: Record<string, unknown>;
}

export function createDrawer(
  svgNode: SVGSVGElement,
  config: DrawerConfig,
  themeVariables?: Record<string, unknown>
): PrimitiveDrawer {
  if (config.look === 'handDrawn') {
    return new RoughDrawer(svgNode, {
      seed: config.handDrawnSeed ?? 0,
      profile: config.handDrawnProfile ?? 'loose',
      roughness: config.roughness,
      bowing: config.bowing,
      disableMultiStroke: config.disableMultiStroke,
      themeVariables: themeVariables ?? config.themeVariables,
    });
  }
  return new SvgDrawer();
}
