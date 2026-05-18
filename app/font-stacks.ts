/** 英数字向け — font-family スタックの先頭に置き、日本語は Noto Sans JP にフォールバック */
export const FONT_MONO_STACK = [
  'ui-monospace',
  'SFMono-Regular',
  'Menlo',
  'Monaco',
  'Consolas',
  'Liberation Mono',
  'Courier New',
  'monospace',
] as const;
