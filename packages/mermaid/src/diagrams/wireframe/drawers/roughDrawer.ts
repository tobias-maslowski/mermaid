import rough from 'roughjs';
import { select } from 'd3';
import type {
  PrimitiveDrawer,
  PrimitiveStyleOptions,
  SVGGroupSelection,
  SVGElementSelection,
} from './types.js';

export type RoughProfile = 'loose' | 'artist' | 'architect' | 'marker';

export interface RoughProfileSettings {
  roughness: number;
  bowing: number;
  disableMultiStroke: boolean;
  strokeWidthMultiplier?: number;
}

export const ROUGH_PROFILES: Record<RoughProfile, RoughProfileSettings> = {
  loose: {
    roughness: 2.2,
    bowing: 3.5,
    disableMultiStroke: false,
    strokeWidthMultiplier: 1.0,
  },
  artist: {
    roughness: 1.2,
    bowing: 1.2,
    disableMultiStroke: false,
    strokeWidthMultiplier: 1.0,
  },
  architect: {
    roughness: 0.15,
    bowing: 0.2,
    disableMultiStroke: true,
    strokeWidthMultiplier: 0.85,
  },
  marker: {
    roughness: 0.7,
    bowing: 1.8,
    disableMultiStroke: true,
    strokeWidthMultiplier: 1.6,
  },
};

export interface RoughDrawerOptions {
  seed?: number;
  profile?: RoughProfile;
  roughness?: number;
  bowing?: number;
  disableMultiStroke?: boolean;
  themeVariables?: Record<string, unknown>;
}

export class RoughDrawer implements PrimitiveDrawer {
  private rc: ReturnType<typeof rough.svg>;
  private seed: number;
  private defaultRoughness: number;
  private defaultBowing: number;
  private defaultDisableMultiStroke: boolean;
  private strokeWidthMultiplier: number;
  private theme: Record<string, string>;

  constructor(svgNode: SVGSVGElement, options: RoughDrawerOptions = {}) {
    this.rc = rough.svg(svgNode);
    this.seed = options.seed ?? 0;

    const profileKey = options.profile ?? 'loose';
    const profile = ROUGH_PROFILES[profileKey] ?? ROUGH_PROFILES.loose;

    this.defaultRoughness = options.roughness ?? profile.roughness;
    this.defaultBowing = options.bowing ?? profile.bowing;
    this.defaultDisableMultiStroke = options.disableMultiStroke ?? profile.disableMultiStroke;
    this.strokeWidthMultiplier = profile.strokeWidthMultiplier ?? 1.0;

    const tv = options.themeVariables ?? {};
    this.theme = {
      mainBkg: (tv.mainBkg as string) || '#ffffff',
      textColor: (tv.textColor as string) || '#2c2c2c',
      primaryColor: (tv.primaryColor as string) || '#2563eb',
      primaryTextColor: (tv.primaryTextColor as string) || '#ffffff',
      secondaryColor: (tv.secondaryColor as string) || '#f3f4f6',
      tertiaryColor: (tv.tertiaryColor as string) || '#e5e7eb',
      lineColor: (tv.lineColor as string) || '#2c2c2c',
      primaryBorderColor:
        (tv.primaryBorderColor as string) || (tv.lineColor as string) || '#2c2c2c',
      dotCloseColor: (tv.dotCloseColor as string) || '#ff5f56',
      dotMinimizeColor: (tv.dotMinimizeColor as string) || '#ffbd2e',
      dotMaximizeColor: (tv.dotMaximizeColor as string) || '#27c93f',
    };
  }

  private resolveRoughOptions(options?: PrimitiveStyleOptions): Record<string, unknown> {
    const className = options?.className ?? '';
    const classes = className.split(/\s+/).filter(Boolean);

    let fill: string | undefined = options?.fill;
    let stroke: string | undefined = options?.stroke;
    let strokeWidth: number = typeof options?.strokeWidth === 'number' ? options.strokeWidth : 1.5;
    const fillStyle: 'solid' | 'hachure' = options?.fillStyle ?? 'solid';
    let strokeLineDash: number[] | undefined = undefined;

    if (options?.strokeDasharray) {
      const parts = options.strokeDasharray
        .split(/[\s,]+/)
        .map(Number)
        .filter((n) => !isNaN(n));
      if (parts.length > 0) {
        strokeLineDash = parts;
      }
    }

    // Resolve color styles based on class hierarchy if not explicitly provided
    if (!fill || !stroke) {
      if (
        classes.includes('wireframe-button-primary') ||
        classes.includes('wireframe-action-button-primary')
      ) {
        fill = fill ?? this.theme.primaryColor;
        stroke = stroke ?? this.theme.primaryBorderColor;
        strokeWidth = 2;
      } else if (classes.includes('wireframe-action-bar')) {
        fill = fill ?? this.theme.secondaryColor;
        stroke = stroke ?? this.theme.primaryBorderColor;
        strokeWidth = 2;
      } else if (
        classes.includes('wireframe-action-button') ||
        classes.includes('wireframe-tab-active')
      ) {
        fill = fill ?? this.theme.mainBkg;
        stroke = stroke ?? this.theme.primaryBorderColor;
        strokeWidth = 1.5;
      } else if (classes.includes('wireframe-button')) {
        fill = fill ?? this.theme.tertiaryColor;
        stroke = stroke ?? this.theme.primaryBorderColor;
        strokeWidth = 2;
      } else if (classes.includes('wireframe-tab')) {
        fill = fill ?? this.theme.secondaryColor;
        stroke = stroke ?? this.theme.primaryBorderColor;
        strokeWidth = 1.8;
      } else if (classes.includes('wireframe-input')) {
        fill = fill ?? this.theme.mainBkg;
        stroke = stroke ?? this.theme.primaryBorderColor;
        strokeWidth = 1.8;
      } else if (
        classes.includes('wireframe-container') ||
        classes.includes('wireframe-menu-box')
      ) {
        fill = fill ?? this.theme.mainBkg;
        stroke = stroke ?? this.theme.primaryBorderColor;
        strokeWidth = 2;
      } else if (classes.includes('wireframe-checkmark')) {
        fill = 'none';
        stroke = stroke ?? this.theme.primaryColor;
        strokeWidth = 2.5;
      } else if (classes.includes('wireframe-radio-dot')) {
        fill = fill ?? this.theme.primaryColor;
        stroke = 'none';
      } else if (
        classes.includes('wireframe-radio-circle') ||
        classes.includes('wireframe-checkbox-box')
      ) {
        fill = fill ?? this.theme.mainBkg;
        stroke = stroke ?? this.theme.primaryBorderColor;
        strokeWidth = 1.8;
      } else if (
        classes.includes('wireframe-dropdown-arrow') ||
        classes.includes('wireframe-arrow-head')
      ) {
        fill = fill ?? this.theme.textColor;
        stroke = stroke ?? this.theme.textColor;
      } else if (classes.includes('wireframe-rule')) {
        fill = 'none';
        stroke = stroke ?? this.theme.lineColor;
        strokeWidth = 2;
        strokeLineDash ??= [4, 4];
      } else if (classes.includes('wireframe-title-bar')) {
        fill = fill ?? this.theme.secondaryColor;
        stroke = stroke ?? this.theme.primaryBorderColor;
        strokeWidth = 1.5;
      } else if (classes.includes('wireframe-title-bar-dot-close')) {
        fill = fill ?? this.theme.dotCloseColor;
        stroke = 'none';
      } else if (classes.includes('wireframe-title-bar-dot-minimize')) {
        fill = fill ?? this.theme.dotMinimizeColor;
        stroke = 'none';
      } else if (classes.includes('wireframe-title-bar-dot-maximize')) {
        fill = fill ?? this.theme.dotMaximizeColor;
        stroke = 'none';
      } else if (classes.includes('wireframe-icon-box')) {
        fill = fill ?? this.theme.tertiaryColor;
        stroke = stroke ?? this.theme.primaryBorderColor;
        strokeWidth = 1.5;
      } else if (classes.includes('wireframe-fieldset-legend-bg')) {
        fill = fill ?? this.theme.mainBkg;
        stroke = stroke ?? this.theme.primaryBorderColor;
        strokeWidth = 1.5;
      } else if (classes.includes('wireframe-section-header')) {
        fill = fill ?? this.theme.secondaryColor;
        stroke = 'none';
      } else if (classes.includes('wireframe-section-divider')) {
        fill = 'none';
        stroke = stroke ?? this.theme.primaryBorderColor;
        strokeWidth = 1.5;
      }
    }

    return {
      seed: this.seed,
      roughness: options?.roughness ?? this.defaultRoughness,
      bowing: options?.bowing ?? this.defaultBowing,
      disableMultiStroke: this.defaultDisableMultiStroke,
      fill: fill ?? 'none',
      fillStyle,
      stroke: stroke ?? (classes.length > 0 ? this.theme.primaryBorderColor : 'none'),
      strokeWidth: strokeWidth * this.strokeWidthMultiplier,
      strokeLineDash,
    };
  }

  rect(
    parent: SVGGroupSelection,
    x: number,
    y: number,
    width: number,
    height: number,
    options?: PrimitiveStyleOptions
  ): SVGElementSelection {
    const roughOpts = this.resolveRoughOptions(options);
    const node = this.rc.rectangle(x, y, width, height, roughOpts);

    if (options?.className) {
      node.setAttribute('class', options.className);
    }
    if (options?.filter) {
      node.setAttribute('style', `filter: ${options.filter}`);
    }

    const parentNode = parent.node();
    if (parentNode) {
      parentNode.appendChild(node);
    }

    return select(node as unknown as SVGElement);
  }

  circle(
    parent: SVGGroupSelection,
    cx: number,
    cy: number,
    r: number,
    options?: PrimitiveStyleOptions
  ): SVGElementSelection {
    const roughOpts = this.resolveRoughOptions(options);
    // rough.js circle takes (x, y, diameter)
    const node = this.rc.circle(cx, cy, r * 2, roughOpts);

    if (options?.className) {
      node.setAttribute('class', options.className);
    }

    const parentNode = parent.node();
    if (parentNode) {
      parentNode.appendChild(node);
    }

    return select(node as unknown as SVGElement);
  }

  line(
    parent: SVGGroupSelection,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    options?: PrimitiveStyleOptions
  ): SVGElementSelection {
    const roughOpts = this.resolveRoughOptions(options);
    const node = this.rc.line(x1, y1, x2, y2, roughOpts);

    if (options?.className) {
      node.setAttribute('class', options.className);
    }

    const parentNode = parent.node();
    if (parentNode) {
      parentNode.appendChild(node);
    }

    return select(node as unknown as SVGElement);
  }

  path(parent: SVGGroupSelection, d: string, options?: PrimitiveStyleOptions): SVGElementSelection {
    const roughOpts = this.resolveRoughOptions(options);
    const node = this.rc.path(d, roughOpts);

    if (options?.className) {
      node.setAttribute('class', options.className);
    }

    const parentNode = parent.node();
    if (parentNode) {
      parentNode.appendChild(node);
    }

    return select(node as unknown as SVGElement);
  }

  text(
    parent: SVGGroupSelection,
    content: string,
    x: number,
    y: number,
    options?: PrimitiveStyleOptions
  ): SVGElementSelection {
    // Rough.js does not render text directly; use SVG <text> with wireframe sketch font styles
    const el = parent.append('text').attr('x', x).attr('y', y).text(content);

    const anchor = options?.textAnchor ?? options?.anchor;
    if (anchor) {
      el.attr('text-anchor', anchor);
    }
    if (options?.dominantBaseline) {
      el.attr('dominant-baseline', options.dominantBaseline);
    }
    if (options?.className) {
      el.attr('class', options.className);
    }
    if (options?.fill) {
      el.attr('fill', options.fill);
    }
    if (options?.fontWeight) {
      el.style('font-weight', String(options.fontWeight));
    }
    if (options?.fontStyle) {
      el.style('font-style', options.fontStyle);
    }
    if (options?.textDecoration) {
      el.style('text-decoration', options.textDecoration);
    }
    if (options?.fontSize) {
      el.style('font-size', options.fontSize);
    }

    return el as unknown as SVGElementSelection;
  }
}
