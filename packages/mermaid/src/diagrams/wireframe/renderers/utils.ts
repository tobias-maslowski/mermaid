/**
 * Pure domain & string utilities for wireframe components
 */

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\da-z]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const truncateText = (text: string, maxWidth: number, charWidth = 8): string => {
  if (maxWidth <= 0) {
    return text;
  }
  const maxChars = Math.floor((maxWidth - 12) / charWidth);
  if (maxChars > 3 && text.length > maxChars) {
    return text.slice(0, maxChars - 1) + '…';
  }
  return text;
};

export const stripQuotes = (text: string): string => {
  if (!text) {
    return '';
  }
  return text.trim().replace(/^["']|["']$/g, '');
};

export const hasShowTabs = (comp?: { showTabs?: boolean; showTabsValue?: unknown[] }): boolean => {
  if (!comp) {
    return false;
  }
  return (
    Boolean(comp.showTabs) || (Array.isArray(comp.showTabsValue) && comp.showTabsValue.length > 0)
  );
};

export const resolveActiveTabIdx = (
  comp: {
    activeTab?: number | string;
    tabs?: { value?: string }[];
    tabBlocks?: { label?: string; id?: string }[];
  },
  totalTabs: number
): number => {
  if (comp.activeTab === undefined || totalTabs <= 0) {
    return 0;
  }
  const rawActive = comp.activeTab;
  if (typeof rawActive === 'number') {
    if (rawActive >= 1 && rawActive <= totalTabs) {
      return rawActive - 1;
    }
    if (rawActive >= 0 && rawActive < totalTabs) {
      return rawActive;
    }
  }
  const targetKey = stripQuotes(String(rawActive));
  const targetSlug = slugify(targetKey);
  const numericVal = parseInt(targetKey, 10);
  const tabs = comp.tabs ?? [];
  const tabBlocks = comp.tabBlocks ?? [];

  for (let idx = 0; idx < totalTabs; idx++) {
    const tabLabel = tabs[idx]?.value ?? tabBlocks[idx]?.label ?? `Tab ${idx + 1}`;
    const tabSlug = slugify(tabLabel);
    const explicitId = tabBlocks[idx]?.id?.toLowerCase();

    if (
      (explicitId && explicitId === targetKey.toLowerCase()) ||
      tabSlug === targetKey.toLowerCase() ||
      tabSlug === targetSlug ||
      (!isNaN(numericVal) && numericVal === idx + 1)
    ) {
      return idx;
    }
  }
  return 0;
};
