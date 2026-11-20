import type { ToolConfig } from '@itsjust/core';

export const toolConfig = {
  id: 'tool-1795206010',
  name: 'HTML Entity Encoder/Decoder',
  category: 'Text',
  description:
    'Encode and decode HTML entities in text with named/numeric entity support and live preview.',
  version: '1.0.0',
  exportFormats: ['png', 'jpeg', 'webp', 'pdf'],
  features: {
    sidebar: true,
    export: true,
    autoSave: true,
    undoRedo: true,
    statusBar: true,
    darkMode: true,
  },
} as unknown as ToolConfig;

export default toolConfig;

export const templateBaseVersion = '1.0.0';
