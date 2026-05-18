import { Noto_Sans_JP } from 'next/font/google';

export { FONT_MONO_STACK } from './font-stacks';

export const notoSansJP = Noto_Sans_JP({
  weight: ['400', '500', '600', '700'],
  preload: false,
  variable: '--font-noto-sans-jp',
  display: 'swap',
  adjustFontFallback: true,
  fallback: ['system-ui', 'sans-serif'],
});
