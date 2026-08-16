import {
  isButton,
  isTextField,
  isMultiField,
  isTextArea,
  isSelectField,
  isComboBox,
  isCheckboxField,
  isCheckboxGroup,
  isRadioGroup,
  type Button,
  type TextField,
  type MultiField,
  type TextArea,
  type SelectField,
  type ComboBox,
  type CheckboxField,
  type CheckboxGroup,
  type RadioGroup,
} from '@mermaid-js/parser';
import type { ComponentRenderer, ComponentRenderContext } from './types.js';
import type { WireframeComponent } from '@mermaid-js/parser';
import { truncateText } from './utils.js';

export const buttonRenderer: ComponentRenderer<Button> = {
  type: 'Button',
  guard: isButton,
  render: ({ parentElem, node, drawer }) => {
    const { x, y, width, height, astNode } = node;
    const label = astNode.label ?? 'Button';
    const isPrimary = astNode.primary ?? false;

    const g = parentElem.append('g').attr('class', 'wireframe-comp wireframe-button-group');

    drawer.rect(g, x, y, width, height, {
      className: isPrimary ? 'wireframe-button wireframe-button-primary' : 'wireframe-button',
      rx: 5,
    });

    drawer.text(g, truncateText(label, width - 8), x + width / 2, y + height / 2, {
      className: isPrimary ? 'wireframe-text wireframe-text-primary' : 'wireframe-text',
      anchor: 'middle',
      dominantBaseline: 'central',
    });
  },
};

const renderTextField = ({
  parentElem,
  node,
  drawer,
}: ComponentRenderContext<WireframeComponent>) => {
  const { x, y, width, height, astNode } = node;
  const label = astNode.label ?? (isTextField(astNode) ? astNode.type : undefined) ?? 'Input';
  const g = parentElem.append('g').attr('class', 'wireframe-comp wireframe-textfield');

  let currentY = y;
  if (label) {
    drawer.text(g, label, x, currentY + 14, { className: 'wireframe-text' });
    currentY += 20;
  }

  const inputHeight = Math.max(28, height - (label ? 20 : 0));
  drawer.rect(g, x, currentY, width, inputHeight, {
    className: 'wireframe-input',
    rx: 5,
  });
};

export const textFieldRenderer: ComponentRenderer<TextField> = {
  type: 'TextField',
  guard: isTextField,
  render: renderTextField,
};

export const multiFieldRenderer: ComponentRenderer<MultiField> = {
  type: 'MultiField',
  guard: isMultiField,
  render: renderTextField,
};

export const textAreaRenderer: ComponentRenderer<TextArea> = {
  type: 'TextArea',
  guard: isTextArea,
  render: ({ parentElem, node, drawer }) => {
    const { x, y, width, height, astNode } = node;
    const label = astNode.label;
    const isRichText = astNode.richtext ?? false;
    const g = parentElem.append('g').attr('class', 'wireframe-comp wireframe-textarea');

    let currentY = y;
    if (label) {
      drawer.text(g, label, x, currentY + 14, { className: 'wireframe-text' });
      currentY += 20;
    }

    const boxHeight = Math.max(50, height - (label ? 20 : 0));
    drawer.rect(g, x, currentY, width, boxHeight, {
      className: 'wireframe-input',
      rx: 5,
    });

    if (isRichText) {
      const toolbarHeight = 30;
      // Background header fill for toolbar bar
      drawer.rect(g, x + 1, currentY + 1, width - 2, toolbarHeight - 1, {
        className: 'wireframe-section-header',
        rx: 4,
      });

      // Divider line under rich text toolbar
      drawer.line(g, x, currentY + toolbarHeight, x + width, currentY + toolbarHeight, {
        className: 'wireframe-rule',
      });

      const barY = currentY + toolbarHeight / 2;

      // 1. Font Family Dropdown Mock
      const fontBoxWidth = 56;
      drawer.rect(g, x + 6, currentY + 5, fontBoxWidth, 20, {
        className: 'wireframe-input',
        rx: 3,
      });
      drawer.text(g, 'Sans', x + 10, barY + 4, {
        className: 'wireframe-text wireframe-text-small',
      });
      drawer.path(
        g,
        `M ${x + 6 + fontBoxWidth - 13} ${barY - 3} L ${x + 6 + fontBoxWidth - 5} ${barY - 3} L ${x + 6 + fontBoxWidth - 9} ${barY + 3} Z`,
        { className: 'wireframe-dropdown-arrow' }
      );

      // 2. Font Size Dropdown Mock
      const sizeBoxWidth = 36;
      drawer.rect(g, x + 68, currentY + 5, sizeBoxWidth, 20, {
        className: 'wireframe-input',
        rx: 3,
      });
      drawer.text(g, '12', x + 72, barY + 4, {
        className: 'wireframe-text wireframe-text-small',
      });
      drawer.path(
        g,
        `M ${x + 68 + sizeBoxWidth - 13} ${barY - 3} L ${x + 68 + sizeBoxWidth - 5} ${barY - 3} L ${x + 68 + sizeBoxWidth - 9} ${barY + 3} Z`,
        { className: 'wireframe-dropdown-arrow' }
      );

      // 3. Vertical Separator 1
      let itemX = x + 112;
      if (itemX + 8 <= x + width - 10) {
        drawer.line(g, itemX, currentY + 6, itemX, currentY + 24, {
          className: 'wireframe-rule',
        });
        itemX += 12;
      }

      // 4. Text Style Formatting Icons (B, I, U, S)
      const formatTools = [
        { label: 'B', fontClass: 'wireframe-text wireframe-bold' },
        { label: 'I', fontClass: 'wireframe-text wireframe-italic' },
        { label: 'U', fontClass: 'wireframe-text wireframe-underline' },
        { label: 'S', fontClass: 'wireframe-text wireframe-strikethrough' },
      ];

      for (const tool of formatTools) {
        if (itemX + 18 > x + width - 10) {
          break;
        }
        drawer.text(g, tool.label, itemX, barY + 4, { className: tool.fontClass });
        itemX += 22;
      }

      // 5. Vertical Separator 2
      if (itemX + 8 <= x + width - 10) {
        drawer.line(g, itemX, currentY + 6, itemX, currentY + 24, {
          className: 'wireframe-rule',
        });
        itemX += 12;
      }

      // 6. Alignment, List & Action Icons
      const actionTools = [
        { label: '≡', width: 18 },
        { label: '•=', width: 22 },
        { label: '1.', width: 20 },
        { label: '🔗', width: 22 },
        { label: '🎨', width: 22 },
      ];

      for (const tool of actionTools) {
        if (itemX + tool.width > x + width - 8) {
          break;
        }
        drawer.text(g, tool.label, itemX, barY + 4, {
          className: 'wireframe-text wireframe-text-small',
        });
        itemX += tool.width + 4;
      }
    }

    let val = astNode.value;
    if (val) {
      if (
        (val.startsWith('`') && val.endsWith('`')) ||
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }

      const toolbarOffset = isRichText ? 30 : 0;
      let textLineY = currentY + toolbarOffset + 18;
      const lines = val.split('\n');
      for (const line of lines) {
        if (textLineY > currentY + boxHeight - 6) {
          break;
        }
        drawer.text(g, truncateText(line, width - 16), x + 8, textLineY, {
          className: 'wireframe-text',
          anchor: 'start',
        });
        textLineY += 18;
      }
    }
  },
};

const renderSelectField = ({
  parentElem,
  node,
  drawer,
}: ComponentRenderContext<WireframeComponent>) => {
  const { x, y, width, height, astNode } = node;
  const label = astNode.label ?? 'Select...';
  const g = parentElem.append('g').attr('class', 'wireframe-comp wireframe-select');

  drawer.rect(g, x, y, width, height, { className: 'wireframe-input', rx: 5 });
  drawer.text(g, label, x + 10, y + height / 2 + 5, { className: 'wireframe-text' });
  drawer.path(
    g,
    `M ${x + width - 16} ${y + height / 2 - 3} L ${x + width - 8} ${y + height / 2 - 3} L ${x + width - 12} ${y + height / 2 + 3} Z`,
    { className: 'wireframe-dropdown-arrow' }
  );
};

export const selectFieldRenderer: ComponentRenderer<SelectField> = {
  type: 'SelectField',
  guard: isSelectField,
  render: renderSelectField,
};

export const comboBoxRenderer: ComponentRenderer<ComboBox> = {
  type: 'ComboBox',
  guard: isComboBox,
  render: renderSelectField,
};

export const checkboxFieldRenderer: ComponentRenderer<CheckboxField> = {
  type: 'CheckboxField',
  guard: isCheckboxField,
  render: ({ parentElem, node, drawer }) => {
    const { x, y, astNode } = node;
    const label = astNode.label ?? '';
    const size = 18;
    const g = parentElem.append('g').attr('class', 'wireframe-comp wireframe-checkbox');

    drawer.rect(g, x, y, size, size, { className: 'wireframe-checkbox-box', rx: 3 });
    if (astNode.checked) {
      drawer.path(g, `M ${x + 3} ${y + 8} L ${x + 7} ${y + 13} L ${x + 14} ${y + 4}`, {
        className: 'wireframe-checkmark',
        strokeWidth: 2.5,
        fill: 'none',
      });
    }
    if (label) {
      drawer.text(g, label, x + size + 8, y + 14, { className: 'wireframe-text' });
    }
  },
};

export const checkboxGroupRenderer: ComponentRenderer<CheckboxGroup> = {
  type: 'CheckboxGroup',
  guard: isCheckboxGroup,
  render: ({ parentElem, node, drawer }) => {
    const { x, y, astNode } = node;
    const g = parentElem.append('g').attr('class', 'wireframe-comp wireframe-checkbox-group');

    let currentY = y;
    if (astNode.label) {
      drawer.text(g, astNode.label, x, currentY + 14, {
        className: 'wireframe-text wireframe-bold',
      });
      currentY += 22;
    }

    if (astNode.options) {
      const size = 18;
      for (const opt of astNode.options) {
        drawer.rect(g, x, currentY, size, size, { className: 'wireframe-checkbox-box', rx: 3 });
        if (opt.selected) {
          drawer.path(
            g,
            `M ${x + 3} ${currentY + 8} L ${x + 7} ${currentY + 13} L ${x + 14} ${currentY + 4}`,
            {
              className: 'wireframe-checkmark',
              strokeWidth: 2.5,
              fill: 'none',
            }
          );
        }
        drawer.text(g, opt.value ?? '', x + size + 8, currentY + 14, {
          className: 'wireframe-text',
        });
        currentY += 24;
      }
    }
  },
};

export const radioGroupRenderer: ComponentRenderer<RadioGroup> = {
  type: 'RadioGroup',
  guard: isRadioGroup,
  render: ({ parentElem, node, drawer }) => {
    const { x, y, astNode } = node;
    const g = parentElem.append('g').attr('class', 'wireframe-comp wireframe-radio-group');

    let currentY = y;
    if (astNode.label) {
      drawer.text(g, astNode.label, x, currentY + 14, {
        className: 'wireframe-text wireframe-bold',
      });
      currentY += 22;
    }

    if (astNode.options) {
      const size = 16;
      for (const opt of astNode.options) {
        const cx = x + size / 2;
        const cy = currentY + size / 2;
        drawer.circle(g, cx, cy, size / 2, { className: 'wireframe-radio-circle' });

        if (opt.selected) {
          drawer.circle(g, cx, cy, 4, { className: 'wireframe-radio-dot' });
        }
        drawer.text(g, opt.value ?? '', x + size + 10, currentY + 13, {
          className: 'wireframe-text',
        });
        currentY += 24;
      }
    }
  },
};
