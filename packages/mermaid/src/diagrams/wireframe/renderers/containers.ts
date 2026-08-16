import {
  isWireframeSection,
  isFieldSet,
  isTitleWindow,
  isColumns,
  isColBlock,
  isContentTabs,
  isTabPane,
  isAccordion,
  isTabBar,
  type WireframeSection,
  type FieldSet,
  type TitleWindow,
  type Columns,
  type ColBlock,
  type ContentTabs,
  type TabPane,
  type Accordion,
  type TabBar,
} from '@mermaid-js/parser';
import type { ComponentRenderer } from './types.js';
import type { PrimitiveDrawer, SVGGroupSelection } from '../drawers/index.js';
import { hasShowTabs, resolveActiveTabIdx } from './utils.js';

const renderTabStrip = (
  drawer: PrimitiveDrawer,
  g: SVGGroupSelection,
  tabs: { value?: string }[],
  activeIdx: number,
  x: number,
  y: number,
  tabHeight = 30
): number => {
  let tabX = x;
  tabs.forEach((tab, idx) => {
    const tabLabel = tab.value ?? `Tab ${idx + 1}`;
    const tabWidth = Math.max(70, tabLabel.length * 8 + 20);
    const isActive = idx === activeIdx;

    drawer.rect(g, tabX, y, tabWidth, tabHeight, {
      className: isActive ? 'wireframe-tab wireframe-tab-active' : 'wireframe-tab',
    });

    drawer.text(g, tabLabel, tabX + tabWidth / 2, y + tabHeight / 2 + 4, {
      className: 'wireframe-text',
      anchor: 'middle',
    });
    tabX += tabWidth + 4;
  });
  return tabX;
};

export const sectionRenderer: ComponentRenderer<WireframeSection> = {
  type: 'WireframeSection',
  guard: isWireframeSection,
  render: ({ parentElem, node, drawer, renderChildNodes }) => {
    const { x, y, width, height, astNode, children } = node;
    const title = astNode.label ?? '';
    const headerHeight = title ? 28 : 0;

    const g = parentElem.append('g').attr('class', 'wireframe-comp wireframe-section');

    // Outer container frame
    drawer.rect(g, x, y, width, height, {
      className: 'wireframe-container',
      rx: 6,
    });

    if (title) {
      // Header strip with rounded top corners matching container rx: 6px
      drawer.path(
        g,
        `M ${x + 1} ${y + headerHeight} L ${x + 1} ${y + 6} Q ${x + 1} ${y + 1} ${x + 6} ${y + 1} L ${x + width - 6} ${y + 1} Q ${x + width - 1} ${y + 1} ${x + width - 1} ${y + 6} L ${x + width - 1} ${y + headerHeight} Z`,
        { className: 'wireframe-section-header' }
      );

      drawer.line(g, x, y + headerHeight, x + width, y + headerHeight, {
        className: 'wireframe-section-divider',
      });

      drawer.text(g, title, x + 12, y + headerHeight / 2 + 4, {
        className: 'wireframe-text wireframe-container-title',
        anchor: 'start',
      });
    }

    if (children?.length) {
      renderChildNodes(g, children);
    }
  },
};

export const fieldSetRenderer: ComponentRenderer<FieldSet> = {
  type: 'FieldSet',
  guard: isFieldSet,
  render: ({ parentElem, node, drawer, renderChildNodes }) => {
    const { x, y, width, height, astNode, children } = node;
    const legend = astNode.label ?? '';
    const g = parentElem.append('g').attr('class', 'wireframe-comp wireframe-fieldset');

    drawer.rect(g, x, y, width, height, {
      className: 'wireframe-container',
      rx: 6,
    });

    if (legend) {
      const paddingX = 12;
      const legendWidth = Math.max(40, legend.length * 8.5 + paddingX * 2);
      const legendX = x + 12;
      const legendY = y - 10;

      // Legend badge sitting on top of the fieldset border
      drawer.rect(g, legendX, legendY, legendWidth, 20, {
        className: 'wireframe-fieldset-legend-bg',
        rx: 4,
      });

      drawer.text(g, legend, legendX + legendWidth / 2, y + 5, {
        className: 'wireframe-text wireframe-container-title',
        anchor: 'middle',
      });
    }

    if (children?.length) {
      renderChildNodes(g, children);
    }
  },
};

export const titleWindowRenderer: ComponentRenderer<TitleWindow> = {
  type: 'TitleWindow',
  guard: isTitleWindow,
  render: ({ parentElem, node, drawer, renderChildNodes }) => {
    const { x, y, width, height, astNode, children } = node;
    const title = astNode.label ?? 'Window';
    const titleBarHeight = 28;
    const g = parentElem.append('g').attr('class', 'wireframe-comp wireframe-titlewindow');

    // Outer container
    drawer.rect(g, x, y, width, height, {
      className: 'wireframe-container',
      rx: 6,
    });

    // Title bar background
    drawer.rect(g, x, y, width, titleBarHeight, {
      className: 'wireframe-title-bar',
    });

    // Window controls (close, minimize, maximize dots)
    const dotClasses = [
      'wireframe-title-bar-dot-close',
      'wireframe-title-bar-dot-minimize',
      'wireframe-title-bar-dot-maximize',
    ];
    dotClasses.forEach((dotClass, idx) => {
      drawer.circle(g, x + 12 + idx * 14, y + titleBarHeight / 2, 4.5, {
        className: `wireframe-title-bar-dot ${dotClass}`,
      });
    });

    // Window Title
    drawer.text(g, title, x + width / 2, y + titleBarHeight / 2 + 4, {
      className: 'wireframe-text wireframe-bold',
      anchor: 'middle',
    });

    if (children?.length) {
      renderChildNodes(g, children);
    }
  },
};

export const columnsRenderer: ComponentRenderer<Columns> = {
  type: 'Columns',
  guard: isColumns,
  render: ({ parentElem, node, renderChildNodes }) => {
    const { children } = node;
    if (children?.length) {
      renderChildNodes(parentElem, children);
    }
  },
};

export const contentTabsRenderer: ComponentRenderer<ContentTabs> = {
  type: 'ContentTabs',
  guard: isContentTabs,
  render: ({ parentElem, node, drawer, renderChildNodes }) => {
    const { x, y, width, height, astNode, children } = node;

    if (hasShowTabs(astNode) && children?.length) {
      const g = parentElem.append('g').attr('class', 'wireframe-comp wireframe-show-tabs-group');
      renderChildNodes(g, children);
      return;
    }

    const g = parentElem.append('g').attr('class', 'wireframe-comp wireframe-content-tabs');

    const tabHeight = 30;
    const tabs = astNode.tabs ?? [];
    const activeIdx = resolveActiveTabIdx(astNode, tabs.length);

    renderTabStrip(drawer, g, tabs, activeIdx, x, y, tabHeight);

    // Tab pane container box below
    drawer.rect(g, x, y + tabHeight, width, height - tabHeight, {
      className: 'wireframe-container',
      rx: 5,
    });

    if (children?.length) {
      renderChildNodes(g, children);
    }
  },
};

export const accordionRenderer: ComponentRenderer<Accordion> = {
  type: 'Accordion',
  guard: isAccordion,
  render: ({ parentElem, node, drawer, renderChildNodes }) => {
    const { x, y, width, height, astNode, children } = node;

    const title = astNode.label ?? 'Accordion';
    const isCollapsed = astNode.collapsed ?? false;
    const headerHeight = 32;

    const g = parentElem.append('g').attr('class', 'wireframe-comp wireframe-accordion');

    // Header box
    drawer.rect(g, x, y, width, headerHeight, {
      className: 'wireframe-container',
      rx: 5,
    });
    const arrowChar = isCollapsed ? '▶' : '▼';
    drawer.text(g, `${arrowChar} ${title}`, x + 10, y + 20, {
      className: 'wireframe-text wireframe-bold',
    });

    if (!isCollapsed && children?.length) {
      drawer.rect(g, x, y + headerHeight, width, height - headerHeight, {
        className: 'wireframe-container',
        rx: 5,
      });
      renderChildNodes(g, children);
    }
  },
};

export const tabBarRenderer: ComponentRenderer<TabBar> = {
  type: 'TabBar',
  guard: isTabBar,
  render: ({ parentElem, node, drawer }) => {
    const { x, y, astNode } = node;
    const g = parentElem.append('g').attr('class', 'wireframe-comp wireframe-tabbar');
    const tabHeight = 32;
    const tabs = astNode.tabs ?? [];
    const activeIdx = resolveActiveTabIdx(astNode, tabs.length);

    renderTabStrip(drawer, g, tabs, activeIdx, x, y, tabHeight);
  },
};

export const colBlockRenderer: ComponentRenderer<ColBlock> = {
  type: 'ColBlock',
  guard: isColBlock,
  render: ({ parentElem, node, renderChildNodes }) => {
    const { children } = node;
    if (children?.length) {
      renderChildNodes(parentElem, children);
    }
  },
};

export const tabPaneRenderer: ComponentRenderer<TabPane> = {
  type: 'TabPane',
  guard: isTabPane,
  render: ({ parentElem, node, renderChildNodes }) => {
    const { children } = node;
    if (children?.length) {
      renderChildNodes(parentElem, children);
    }
  },
};
