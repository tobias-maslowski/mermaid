import {
  isIcon,
  isImageField,
  isPathField,
  isArrow,
  isVCurly,
  isVRule,
  isFormattingToolbar,
  isCanvas,
  type Icon,
  type ImageField,
  type PathField,
  type Arrow,
  type VCurly,
  type VRule,
  type FormattingToolbar,
  type Canvas,
} from '@mermaid-js/parser';
import type { ComponentRenderer, ComponentRenderContext } from './types.js';
import type { WireframeComponent } from '@mermaid-js/parser';

export const iconRenderer: ComponentRenderer<Icon> = {
  type: 'Icon',
  guard: isIcon,
  render: ({ parentElem, node, drawer }) => {
    const { x, y, astNode } = node;
    const glyph = astNode.glyph ?? astNode.label ?? 'star';
    const size = 24;
    const g = parentElem.append('g').attr('class', 'wireframe-icon');

    drawer.rect(g, x, y, size, size, { className: 'wireframe-icon-box', rx: 4 });

    const char = glyph ? glyph.charAt(0).toUpperCase() : '*';
    drawer.text(g, char, x + size / 2, y + size / 2 + 5, {
      className: 'wireframe-text wireframe-icon-text',
      anchor: 'middle',
    });
  },
};

const renderImage = ({ parentElem, node, drawer }: ComponentRenderContext<WireframeComponent>) => {
  const { x, y, width, height, astNode } = node;
  const label = astNode.label ?? 'Image';
  const isPath = isPathField(astNode);
  const g = parentElem.append('g').attr('class', 'wireframe-comp wireframe-image');

  // Outer container box
  drawer.rect(g, x, y, width, height, { className: 'wireframe-container' });

  // Diagonal placeholder lines with subtle dashed stroke, inset 5px to fit within rounded corners
  const inset = 5;
  drawer.line(g, x + inset, y + inset, x + width - inset, y + height - inset, {
    className: 'wireframe-rule',
    strokeDasharray: '4 4',
  });

  drawer.line(g, x + width - inset, y + inset, x + inset, y + height - inset, {
    className: 'wireframe-rule',
    strokeDasharray: '4 4',
  });

  if (label) {
    const icon = isPath ? '📁 ' : '🖼️ ';
    const fullText = `${icon}${label}`;
    const approxCharWidth = 7;
    const textWidth = label.length * approxCharWidth + 24;
    const badgeWidth = Math.min(width - 16, Math.max(70, textWidth + 16));
    const badgeHeight = 24;
    const badgeX = x + (width - badgeWidth) / 2;
    const badgeY = y + (height - badgeHeight) / 2;

    // Draw background pill/badge to cleanly obscure line intersection
    drawer.rect(g, badgeX, badgeY, badgeWidth, badgeHeight, {
      className: 'wireframe-fieldset-legend-bg',
      rx: 12,
    });

    // Centered label text inside pill
    drawer.text(g, fullText, x + width / 2, y + height / 2 + 4, {
      className: 'wireframe-text wireframe-text-small',
      anchor: 'middle',
    });
  }
};

export const imageRenderer: ComponentRenderer<ImageField> = {
  type: 'ImageField',
  guard: isImageField,
  render: renderImage,
};

export const pathFieldRenderer: ComponentRenderer<PathField> = {
  type: 'PathField',
  guard: isPathField,
  render: renderImage,
};

const renderVRule = ({ parentElem, node, drawer }: ComponentRenderContext<WireframeComponent>) => {
  const { x, y, width, height, astNode } = node;
  const vruleNode = isVRule(astNode) ? astNode : undefined;
  const label = vruleNode?.label;
  const h = height > 0 ? height : 60;
  const cx = Math.round(x + width / 2);
  const g = parentElem
    .append('g')
    .attr('class', 'wireframe-comp wireframe-divider wireframe-vrule');

  drawer.line(g, cx, y, cx, y + h, { className: 'wireframe-rule' });

  if (label) {
    drawer.text(g, label, cx + 8, y + h / 2 + 4, {
      className: 'wireframe-text wireframe-text-small',
    });
  }
};

const renderVCurly = ({ parentElem, node, drawer }: ComponentRenderContext<WireframeComponent>) => {
  const { x, y, width, height, astNode } = node;
  const curlyNode = isVCurly(astNode) ? astNode : undefined;
  const label = curlyNode?.label;
  const h = height > 0 ? height : 60;
  const half = h / 2;
  const braceWidth = 10;
  const cx = Math.round(x + Math.max(10, (width - braceWidth) / 2));
  const g = parentElem.append('g').attr('class', 'wireframe-comp wireframe-vcurly');

  const pathD =
    `M ${cx},${y} ` +
    `C ${cx},${y + half / 2} ${cx + braceWidth},${y + half / 2} ${cx + braceWidth},${y + half} ` +
    `C ${cx + braceWidth},${y + half + half / 2} ${cx},${y + half + half / 2} ${cx},${y + h}`;

  drawer.path(g, pathD, { className: 'wireframe-rule', fill: 'none' });

  if (label) {
    drawer.text(g, label, cx + braceWidth + 6, y + half + 4, {
      className: 'wireframe-text wireframe-text-small',
    });
  }
};

const renderArrow = ({ parentElem, node, drawer }: ComponentRenderContext<WireframeComponent>) => {
  const { x, y, width, height, astNode } = node;
  const arrowNode = isArrow(astNode) ? astNode : undefined;
  const label = arrowNode?.label;
  const dir = arrowNode?.direction ?? 'right';
  const g = parentElem
    .append('g')
    .attr('class', `wireframe-comp wireframe-arrow wireframe-arrow-${dir}`);

  const midX = Math.round(x + width / 2);
  const midY = Math.round(y + height / 2);
  const headSize = 6;

  let x1 = x;
  let y1 = midY;
  let x2 = x + width;
  let y2 = midY;

  if (dir === 'up' || dir === 'down') {
    x1 = midX;
    y1 = y;
    x2 = midX;
    y2 = y + height;
  }

  drawer.line(g, x1, y1, x2, y2, { className: 'wireframe-rule' });

  const drawHead = (px: number, py: number, direction: 'left' | 'right' | 'up' | 'down') => {
    let d = '';
    if (direction === 'right') {
      d = `M ${px} ${py} L ${px - headSize * 1.5} ${py - headSize} L ${px - headSize * 1.5} ${py + headSize} Z`;
    } else if (direction === 'left') {
      d = `M ${px} ${py} L ${px + headSize * 1.5} ${py - headSize} L ${px + headSize * 1.5} ${py + headSize} Z`;
    } else if (direction === 'up') {
      d = `M ${px} ${py} L ${px - headSize} ${py + headSize * 1.5} L ${px + headSize} ${py + headSize * 1.5} Z`;
    } else if (direction === 'down') {
      d = `M ${px} ${py} L ${px - headSize} ${py - headSize * 1.5} L ${px + headSize} ${py - headSize * 1.5} Z`;
    }
    drawer.path(g, d, { className: 'wireframe-arrow-head' });
  };

  if (dir === 'right' || dir === 'both') {
    drawHead(x2, y2, 'right');
  }
  if (dir === 'left' || dir === 'both') {
    drawHead(x1, y1, 'left');
  }
  if (dir === 'up') {
    drawHead(x1, y1, 'up');
  }
  if (dir === 'down') {
    drawHead(x2, y2, 'down');
  }

  if (label) {
    if (dir === 'up' || dir === 'down') {
      drawer.text(g, label, midX + 10, midY + 4, {
        className: 'wireframe-text wireframe-text-small',
      });
    } else {
      drawer.text(g, label, midX, midY - 6, {
        className: 'wireframe-text wireframe-text-small',
        anchor: 'middle',
      });
    }
  }
};

export const vRuleRenderer: ComponentRenderer<VRule> = {
  type: 'VRule',
  guard: isVRule,
  render: renderVRule,
};

export const arrowRenderer: ComponentRenderer<Arrow> = {
  type: 'Arrow',
  guard: isArrow,
  render: renderArrow,
};

export const vCurlyRenderer: ComponentRenderer<VCurly> = {
  type: 'VCurly',
  guard: isVCurly,
  render: renderVCurly,
};

export const formattingToolbarRenderer: ComponentRenderer<FormattingToolbar> = {
  type: 'FormattingToolbar',
  guard: isFormattingToolbar,
  render: ({ parentElem, node, drawer }) => {
    const { x, y, width, height } = node;
    const g = parentElem.append('g').attr('class', 'wireframe-comp wireframe-toolbar');

    drawer.rect(g, x, y, width, height, { className: 'wireframe-container' });
    const tools = ['B', 'I', 'U', 'S', '≡', '🔗'];
    let btnX = x + 6;
    for (const tool of tools) {
      drawer.text(g, tool, btnX + 6, y + height / 2 + 4, {
        className: 'wireframe-text wireframe-bold',
      });
      btnX += 22;
    }
  },
};

export const canvasRenderer: ComponentRenderer<Canvas> = {
  type: 'Canvas',
  guard: isCanvas,
  render: ({ parentElem, node, drawer }) => {
    const { x, y, width, height, astNode } = node;
    const label = astNode.label ?? 'Canvas';
    const g = parentElem.append('g').attr('class', 'wireframe-comp wireframe-canvas');

    drawer.rect(g, x, y, width, height, { className: 'wireframe-container' });
    if (label) {
      drawer.text(g, label, x + 10, y + 20, {
        className: 'wireframe-text wireframe-bold',
      });
    }
  },
};
