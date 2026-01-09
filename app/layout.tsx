import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@shared/lib/theme';

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: 'ツール集',
  description: '各種ツールの統合アプリケーション',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${notoSansJP.variable} font-sans`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
