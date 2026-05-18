import type { Metadata, Viewport } from 'next';
import './globals.css';
import { notoSansJP } from './fonts';
import { Providers } from '@shared/components/Providers';

export const metadata: Metadata = {
  title: 'ツール集',
  description: '各種ツールの統合アプリケーション',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${notoSansJP.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
