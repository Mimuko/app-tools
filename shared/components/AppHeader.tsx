import { ReactNode } from 'react';

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode; // ThemeToggleなどを配置
  className?: string; // 追加のスタイルクラス
  /**
   * Tailwind CSSを使用する場合のスタイル
   * true: Tailwind CSSのスタイル（request-content-generation-tool用）
   * false: 従来のCSSクラス（qa-generation-tool用）
   */
  useTailwind?: boolean;
}

/**
 * アプリケーションヘッダーコンポーネント
 * Tailwind CSSとCSSの両方に対応
 */
export function AppHeader({ 
  title, 
  subtitle, 
  children, 
  className = '',
  useTailwind = false 
}: AppHeaderProps) {
  if (useTailwind) {
    return (
      <header className={`mb-8 ${className}`}>
        <div className="bg-gradient-primary rounded-lg py-8 px-4 mb-4 shadow-lg relative">
          <div className="header-flex-col relative z-10">
            <div>
              <h1 className="text-2xl font-bold mb-1 header-title-text">{title}</h1>
              {subtitle && <p className="text-sm opacity-100 header-subtitle-text">{subtitle}</p>}
            </div>
            {children && <div>{children}</div>}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`app-header ${className}`}>
      <div className="header-content">
        <div className="header-text">
          <h1>{title}</h1>
          {subtitle && <p className="subtitle">{subtitle}</p>}
        </div>
        {children}
      </div>
    </header>
  );
}
