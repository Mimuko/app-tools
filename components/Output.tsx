'use client';

import { useState, useEffect } from 'react';
import type { Phase } from '@/types/form';

interface OutputProps {
  slackText: string;
  backlogText: string;
  backlogDesignText: string;
  backlogImplementationText: string;
  phase: Phase;
  onGenerate?: () => void;
  onReset?: () => void;
  hasErrors?: boolean;
  isDesignDecisionMissing?: boolean;
}

export function Output({ 
  slackText, 
  backlogText, 
  backlogDesignText, 
  backlogImplementationText,
  phase,
  onGenerate, 
  onReset, 
  hasErrors,
  isDesignDecisionMissing = false
}: OutputProps) {
  // フェーズに応じてデフォルトタブを取得
  const getDefaultTab = (): 'slack' | 'backlog-design' | 'backlog-implementation' => {
    if (phase === 'design_survey') {
      return 'backlog-design';
    } else {
      return 'backlog-implementation';
    }
  };
  
  const [activeTab, setActiveTab] = useState<'slack' | 'backlog-design' | 'backlog-implementation'>(getDefaultTab());
  const [copied, setCopied] = useState<'slack' | 'backlog-design' | 'backlog-implementation' | null>(null);

  // フェーズが変更されたら、デフォルトタブに切り替え
  useEffect(() => {
    if (phase === 'design_survey') {
      setActiveTab('backlog-design');
    } else {
      setActiveTab('backlog-implementation');
    }
  }, [phase]);

  const handleCopy = async (text: string, type: 'slack' | 'backlog-design' | 'backlog-implementation') => {
    try {
      // コピー時はそのまま（Slack版はコードブロック記号を含む）
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('コピーに失敗しました:', err);
      alert('コピーに失敗しました');
    }
  };

  const getCurrentText = (): string => {
    if (activeTab === 'slack') {
      return slackText.replace(/^```\n/, '').replace(/\n```$/, '');
    } else if (activeTab === 'backlog-design') {
      return backlogDesignText;
    } else {
      return backlogImplementationText;
    }
  };

  const getCurrentRawText = (): string => {
    if (activeTab === 'slack') {
      return slackText;
    } else if (activeTab === 'backlog-design') {
      return backlogDesignText;
    } else {
      return backlogImplementationText;
    }
  };

  const displayText = getCurrentText();

  const phaseLabel = phase === 'design_survey' ? 'STEP 1: 設計・調査' : 'STEP 2: 実装';
  const phaseColor = phase === 'design_survey' ? 'blue' : 'green';

  return (
    <div className="h-full flex flex-col">
      {/* 現在のフェーズ表示 */}
      <div className={`mb-4 p-3 rounded-lg border-2 ${
        phase === 'design_survey'
          ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700'
          : 'bg-step2-50 dark:bg-step2-900/20 border-step2-300 dark:border-step2-700'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${
            phase === 'design_survey'
              ? 'text-primary-700 dark:text-primary-300'
              : 'text-step2-700 dark:text-step2-300'
          }`}>
            {phaseLabel}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            のテキストを生成します
          </span>
        </div>
      </div>

      {/* 生成/リセットボタン */}
      {(onGenerate || onReset) && (
        <div className="mb-4 space-y-2">
          <div className="flex gap-2">
            {onGenerate && (
              <button
                onClick={onGenerate}
                disabled={isDesignDecisionMissing && phase === 'implementation'}
                className={`flex-1 px-4 py-2 rounded-md transition-all font-medium shadow-sm ${
                  isDesignDecisionMissing && phase === 'implementation'
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-none'
                    : phase === 'design_survey'
                      ? 'bg-primary-500 dark:bg-primary-600 text-white hover:bg-primary-600 dark:hover:bg-primary-700 hover:shadow-md'
                      : 'bg-step2-500 dark:bg-step2-600 text-white hover:bg-step2-600 dark:hover:bg-step2-700 hover:shadow-md'
                }`}
                title={isDesignDecisionMissing && phase === 'implementation' ? '判断者を確定してください' : undefined}
              >
                生成
              </button>
            )}
            {onReset && (
              <button
                onClick={onReset}
                className="flex-1 px-4 py-2 bg-transparent border-2 border-gray-500 dark:border-gray-400 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-600 dark:hover:border-gray-300 transition-all font-medium"
              >
                リセット
              </button>
            )}
          </div>
          {hasErrors && (
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700 rounded-md text-xs text-yellow-800 dark:text-yellow-200">
              ⚠ 必須項目が未入力です
            </div>
          )}
        </div>
      )}

      {/* タブ */}
      <div className="flex border-b border-gray-300 dark:border-gray-700 mb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('slack')}
          className={`px-4 py-2 font-medium whitespace-nowrap transition-colors ${
            activeTab === 'slack'
              ? `border-b-2 ${phase === 'design_survey' ? 'border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-400' : 'border-step2-500 dark:border-step2-400 text-step2-600 dark:text-step2-400'}`
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          Slack版
        </button>
        {/* 設計・調査フェーズ選択時のみ表示 */}
        {phase === 'design_survey' && (
          <button
            onClick={() => setActiveTab('backlog-design')}
            className={`px-4 py-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'backlog-design'
                ? 'border-b-2 border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Backlog：設計・調査
          </button>
        )}
        {/* 実装フェーズ選択時のみ表示 */}
        {phase === 'implementation' && (
          <button
            onClick={() => setActiveTab('backlog-implementation')}
            className={`px-4 py-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'backlog-implementation'
                ? 'border-b-2 border-step2-500 dark:border-step2-400 text-step2-600 dark:text-step2-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Backlog：実装
          </button>
        )}
      </div>

      {/* コピーボタン */}
      <div className="mb-4">
        <button
          onClick={() => handleCopy(getCurrentRawText(), activeTab)}
          className={`w-full px-4 py-2 text-white rounded-md transition-all font-medium shadow-sm hover:shadow-md ${
            phase === 'design_survey'
              ? 'bg-primary-500 dark:bg-primary-600 hover:bg-primary-600 dark:hover:bg-primary-700'
              : 'bg-step2-500 dark:bg-step2-600 hover:bg-step2-600 dark:hover:bg-step2-700'
          }`}
        >
          {copied === activeTab ? '✓ コピーしました' : 'クリップボードへコピー'}
        </button>
      </div>

      {/* プレビュー */}
      <div className="flex-1 overflow-auto">
        <pre className="whitespace-pre-wrap break-words bg-gray-50 dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700 text-sm font-mono text-gray-900 dark:text-gray-100">
          {displayText}
        </pre>
      </div>
    </div>
  );
}

