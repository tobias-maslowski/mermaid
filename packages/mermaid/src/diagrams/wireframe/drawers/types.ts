import type { Selection } from 'd3';

export type SVGGroupSelection = Selection<SVGGElement, unknown, Element | null, unknown>;
export type SVGElementSelection = Selection<SVGElement, unknown, Element | null, unknown>;

export interface PrimitiveStyleOptions {
  className?: string;
  fill?: string;
  fillStyle?: 'solid' | 'hachure';
  stroke?: string;
  strokeWidth?: number | string;
  strokeDasharray?: string;
  rx?: number;
  ry?: number;
  roughness?: number;
  bowing?: number;
  anchor?: 'start' | 'middle' | 'end';
  textAnchor?: 'start' | 'middle' | 'end';
  dominantBaseline?: 'auto' | 'central' | 'hanging' | 'middle';
  fontWeight?: string | number;
  fontStyle?: string;
  textDecoration?: string;
  fontSize?: string;
  filter?: string;
}

export interface PrimitiveDrawer {
  rect(
    parent: SVGGroupSelection,
    x: number,
    y: number,
    width: number,
    height: number,
    options?: PrimitiveStyleOptions
  ): SVGElementSelection;

  circle(
    parent: SVGGroupSelection,
    cx: number,
    cy: number,
    r: number,
    options?: PrimitiveStyleOptions
  ): SVGElementSelection;

  line(
    parent: SVGGroupSelection,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    options?: PrimitiveStyleOptions
  ): SVGElementSelection;

  path(parent: SVGGroupSelection, d: string, options?: PrimitiveStyleOptions): SVGElementSelection;

  text(
    parent: SVGGroupSelection,
    content: string,
    x: number,
    y: number,
    options?: PrimitiveStyleOptions
  ): SVGElementSelection;
}
