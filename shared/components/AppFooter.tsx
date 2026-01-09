import { ReactNode } from 'react';

export interface AppFooterProps {
  children?: ReactNode;
  className?: string; // 追加のスタイルクラス
  /**
   * Tailwind CSSを使用する場合のスタイル
   * true: Tailwind CSSのスタイル（request-content-generation-tool用）
   * false: 従来のCSSクラス（qa-generation-tool用）
   */
  useTailwind?: boolean;
}

/**
 * アプリケーションフッターコンポーネント
 * Tailwind CSSとCSSの両方に対応
 */
export function AppFooter({ 
  children, 
  className = '',
  useTailwind = false 
}: AppFooterProps) {
  if (useTailwind) {
    return (
      <footer className={`mt-12 pt-8 pb-8 border-t border-gray-200 dark:border-gray-700 ${className}`}>
        {children}
      </footer>
    );
  }

  return (
    <footer className={`app-footer ${className}`}>
      {children}
    </footer>
  );
}
