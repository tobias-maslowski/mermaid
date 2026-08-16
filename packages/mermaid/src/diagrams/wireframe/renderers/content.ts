import {
  isHeading,
  isSubTitle,
  isParagraph,
  isRichText,
  isTextElement,
  isList,
  isTree,
  isMenu,
  type WireframeComponent,
  type Heading,
  type SubTitle,
  type Paragraph,
  type RichText,
  type TextElement,
  type List,
  type Tree,
  type Menu,
} from '@mermaid-js/parser';
import type { ComponentRenderer, ComponentRenderContext } from './types.js';

const renderHeading = ({
  parentElem,
  node,
  drawer,
}: ComponentRenderContext<WireframeComponent>) => {
  const { x, y, astNode } = node;
  const text = astNode.label ?? '';
  const isSub = isSubTitle(astNode);
  const fontSize = isSub ? '16px' : '20px';

  const g = parentElem.append('g').attr('class', 'wireframe-comp wireframe-heading');
  drawer.text(g, text, x, y + (isSub ? 18 : 22), {
    className: 'wireframe-text',
    fontSize,
    fontWeight: 'bold',
  });
};

export const headingRenderer: ComponentRenderer<Heading> = {
  type: 'Heading',
  guard: isHeading,
  render: renderHeading,
};

export const subTitleRenderer: ComponentRenderer<SubTitle> = {
  type: 'SubTitle',
  guard: isSubTitle,
  render: renderHeading,
};

const renderParagraph = ({
  parentElem,
  node,
  drawer,
}: ComponentRenderContext<WireframeComponent>) => {
  const { x, y, astNode } = node;
  const text = astNode.label ?? '';
  const g = parentElem
    .append('g')
    .attr('class', `wireframe-comp wireframe-${astNode.$type.toLowerCase()}`);
  drawer.text(g, text, x, y + 16, { className: 'wireframe-text' });
};

export const paragraphRenderer: ComponentRenderer<Paragraph> = {
  type: 'Paragraph',
  guard: isParagraph,
  render: renderParagraph,
};

export const richTextRenderer: ComponentRenderer<RichText> = {
  type: 'RichText',
  guard: isRichText,
  render: renderParagraph,
};

export const textElementRenderer: ComponentRenderer<TextElement> = {
  type: 'TextElement',
  guard: isTextElement,
  render: renderParagraph,
};

export const listRenderer: ComponentRenderer<List> = {
  type: 'List',
  guard: isList,
  render: ({ parentElem, node, drawer }) => {
    const { x, y, astNode } = node;
    const g = parentElem.append('g').attr('class', 'wireframe-comp wireframe-list');

    let currentY = y;
    if (astNode.items) {
      astNode.items.forEach((item, idx) => {
        const prefix = astNode.ordered ? `${idx + 1}.` : '•';
        drawer.text(g, `${prefix} ${item.value ?? ''}`, x, currentY + 16, {
          className: 'wireframe-text',
        });
        currentY += 22;
      });
    }
  },
};

export const treeRenderer: ComponentRenderer<Tree> = {
  type: 'Tree',
  guard: isTree,
  render: ({ parentElem, node, drawer }) => {
    const { x, y, astNode } = node;
    const g = parentElem.append('g').attr('class', 'wireframe-comp wireframe-tree');

    let currentY = y;
    if (astNode.nodes) {
      for (const treeNode of astNode.nodes) {
        const hasChildren = Boolean(treeNode.children && treeNode.children.length > 0);
        const isExpanded = hasChildren && treeNode.expanded !== false;
        const prefix = hasChildren ? (isExpanded ? '📂' : '📁') : '📄';

        drawer.text(g, `${prefix} ${treeNode.label ?? ''}`, x, currentY + 16, {
          className: 'wireframe-text',
        });
        currentY += 22;

        if (hasChildren && isExpanded && treeNode.children) {
          for (const childLabel of treeNode.children) {
            drawer.text(g, `📄 ${childLabel}`, x + 20, currentY + 16, {
              className: 'wireframe-text',
            });
            currentY += 22;
          }
        }
      }
    }
  },
};

export const menuRenderer: ComponentRenderer<Menu> = {
  type: 'Menu',
  guard: isMenu,
  render: ({ parentElem, node, drawer }) => {
    const { x, y, width, height, astNode } = node;
    const g = parentElem.append('g').attr('class', 'wireframe-comp wireframe-menu');

    drawer.rect(g, x, y, width, height, { className: 'wireframe-menu-box' });

    let currentY = y;
    if (astNode.items) {
      for (const item of astNode.items) {
        drawer.text(g, item.value ?? '', x + 12, currentY + 18, {
          className: 'wireframe-text',
        });
        currentY += 26;
      }
    }
  },
};
