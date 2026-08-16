import type {
  PrimitiveDrawer,
  PrimitiveStyleOptions,
  SVGGroupSelection,
  SVGElementSelection,
} from './types.js';

export class SvgDrawer implements PrimitiveDrawer {
  rect(
    parent: SVGGroupSelection,
    x: number,
    y: number,
    width: number,
    height: number,
    options?: PrimitiveStyleOptions
  ): SVGElementSelection {
    const el = parent
      .append('rect')
      .attr('x', x)
      .attr('y', y)
      .attr('width', width)
      .attr('height', height);

    if (options?.rx !== undefined) {
      el.attr('rx', options.rx);
    }
    if (options?.ry !== undefined) {
      el.attr('ry', options.ry);
    } else if (options?.rx !== undefined) {
      el.attr('ry', options.rx);
    }
    if (options?.className) {
      el.attr('class', options.className);
    }
    if (options?.fill) {
      el.attr('fill', options.fill);
    }
    if (options?.stroke) {
      el.attr('stroke', options.stroke);
    }
    if (options?.strokeWidth !== undefined) {
      el.attr('stroke-width', options.strokeWidth);
    }
    if (options?.strokeDasharray) {
      el.style('stroke-dasharray', options.strokeDasharray);
    }
    if (options?.filter) {
      el.style('filter', options.filter);
    }

    return el as unknown as SVGElementSelection;
  }

  circle(
    parent: SVGGroupSelection,
    cx: number,
    cy: number,
    r: number,
    options?: PrimitiveStyleOptions
  ): SVGElementSelection {
    const el = parent.append('circle').attr('cx', cx).attr('cy', cy).attr('r', r);

    if (options?.className) {
      el.attr('class', options.className);
    }
    if (options?.fill) {
      el.attr('fill', options.fill);
    }
    if (options?.stroke) {
      el.attr('stroke', options.stroke);
    }
    if (options?.strokeWidth !== undefined) {
      el.attr('stroke-width', options.strokeWidth);
    }

    return el as unknown as SVGElementSelection;
  }

  line(
    parent: SVGGroupSelection,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    options?: PrimitiveStyleOptions
  ): SVGElementSelection {
    const el = parent.append('line').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2);

    if (options?.className) {
      el.attr('class', options.className);
    }
    if (options?.stroke) {
      el.attr('stroke', options.stroke);
    }
    if (options?.strokeWidth !== undefined) {
      el.attr('stroke-width', options.strokeWidth);
    }
    if (options?.strokeDasharray) {
      el.style('stroke-dasharray', options.strokeDasharray);
    }

    return el as unknown as SVGElementSelection;
  }

  path(parent: SVGGroupSelection, d: string, options?: PrimitiveStyleOptions): SVGElementSelection {
    const el = parent.append('path').attr('d', d);

    if (options?.className) {
      el.attr('class', options.className);
    }
    if (options?.fill) {
      el.attr('fill', options.fill);
    }
    if (options?.stroke) {
      el.attr('stroke', options.stroke);
    }
    if (options?.strokeWidth !== undefined) {
      el.attr('stroke-width', options.strokeWidth);
    }
    if (options?.strokeDasharray) {
      el.style('stroke-dasharray', options.strokeDasharray);
    }

    return el as unknown as SVGElementSelection;
  }

  text(
    parent: SVGGroupSelection,
    content: string,
    x: number,
    y: number,
    options?: PrimitiveStyleOptions
  ): SVGElementSelection {
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
