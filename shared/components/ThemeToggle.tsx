'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '../lib/theme';

export interface ThemeToggleProps {
  /**
   * Tailwind CSSを使用する場合のスタイル
   * true: Tailwind CSSのスタイル（request-content-generation-tool用）
   * false: 従来のCSSクラス（qa-generation-tool用）
   */
  useTailwind?: boolean;
  className?: string;
}

/**
 * テーマ切り替えボタンコンポーネント
 * useThemeフックを使用してテーマを管理
 */
export function ThemeToggle({ useTailwind = false, className = '' }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // マウント前はプレースホルダーを表示
  if (!mounted) {
    if (useTailwind) {
      return (
        <button
          className={`px-4 py-2 bg-white/20 dark:bg-white/10 rounded-md backdrop-blur-sm border border-white/30 dark:border-white/30 font-medium theme-toggle-text ${className}`}
          disabled
          aria-label="テーマ切り替え"
        >
          🌙 ダーク
        </button>
      );
    }
    
    return (
      <button
        className={`theme-toggle ${className}`}
        disabled
        aria-label="テーマ切り替え"
      >
        🌙
      </button>
    );
  }

  if (useTailwind) {
    return (
      <button
        onClick={toggleTheme}
        className={`px-4 py-2 bg-white/20 dark:bg-white/10 rounded-md hover:bg-white/30 dark:hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/30 dark:border-white/30 font-medium theme-toggle-text ${className}`}
        aria-label={theme === 'light' ? 'ダークモードに切り替え' : 'ライトモードに切り替え'}
      >
        {theme === 'light' ? '🌙 ダーク' : '☀️ ライト'}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      aria-label={theme === 'light' ? 'ダークモードに切り替え' : 'ライトモードに切り替え'}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
