'use client';

import { useState, lazy, Suspense } from 'react';
import { AppHeader, AppFooter, ThemeToggle } from '@shared/components';
import { generateSlackText } from '@/lib/generateSlack';
import { generateBacklogText } from '@/lib/generateBacklog';
import { validateForm, getInitialFormData } from '@/lib/validation';
import type { FormData } from '@/types/form';

// 大きなコンポーネントを動的インポート（コード分割）
const Form = lazy(() => import('@/components/Form').then(mod => ({ default: mod.Form })));
const Output = lazy(() => import('@/components/Output').then(mod => ({ default: mod.Output })));

export default function RequestTool() {
  const [formData, setFormData] = useState<FormData>(getInitialFormData());
  const [errors, setErrors] = useState(validateForm(formData));
  const [slackText, setSlackText] = useState('');
  const [backlogText, setBacklogText] = useState('');
  const [backlogDesignText, setBacklogDesignText] = useState('');
  const [backlogImplementationText, setBacklogImplementationText] = useState('');

  const handleFormChange = (data: FormData) => {
    setFormData(data);
    setErrors(validateForm(data));
  };

  const scrollToForm = () => {
    const formElement = document.getElementById('form-section');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleGenerate = () => {
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    
    // バリデーションエラーがあっても生成は実行する（警告付き）
    setSlackText(generateSlackText(formData));
    const backlogTexts = generateBacklogText(formData);
    setBacklogText(backlogTexts.slack);
    setBacklogDesignText(backlogTexts.design);
    setBacklogImplementationText(backlogTexts.implementation);
  };

  const handleReset = () => {
    if (confirm('入力内容をすべてリセットしますか？')) {
      const initialData = getInitialFormData();
      setFormData(initialData);
      setErrors(validateForm(initialData));
      setSlackText('');
      setBacklogText('');
      setBacklogDesignText('');
      setBacklogImplementationText('');
    }
  };

  const hasErrors = Object.values(errors).some((error) => error);

  // 実装フェーズで判断者が未定の場合のフラグ
  const isDesignDecisionMissing =
    formData.phase === 'implementation' &&
    (formData.designRole === 'existing_tone' || formData.designRole === 'spec_fixed') &&
    formData.exceptionDecisionOwner === '未定（※着手前に確定必須）';

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <AppHeader
          title="実装依頼 生成ツール（PoC）"
          subtitle="実装依頼内容を自動生成します"
          useTailwind={true}
        >
          <ThemeToggle useTailwind={true} />
        </AppHeader>

        {/* フェーズ説明セクション */}
        <div className="mb-8 space-y-6">
          {/* セクション1：設計・調査フェーズ */}
          <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-all ${
            formData.phase === 'design_survey'
              ? 'border-4 border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
              : 'border-2 border-primary-200 dark:border-primary-800 opacity-60'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                設計・調査フェーズ（STEP 1）
              </h2>
              {formData.phase === 'design_survey' && (
                <span className="px-3 py-1 bg-primary-500 dark:bg-primary-600 text-white text-sm font-semibold rounded-full">
                  選択中
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              作り方・影響・判断材料を整理し、実装できる形にする工程
            </p>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">対象の目安：</p>
              <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside space-y-1">
                <li>何を作るか／どう作るかがまだ曖昧</li>
                <li>実現可否や影響範囲が分からない</li>
                <li>まず相談したい</li>
              </ul>
            </div>
            <button
              onClick={() => {
                handleFormChange({ ...formData, phase: 'design_survey' });
                scrollToForm();
              }}
              className={`px-4 py-2 rounded-md transition-all font-medium shadow-sm ${
                formData.phase === 'design_survey'
                  ? 'bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600 shadow-md'
                  : 'bg-primary-500 dark:bg-primary-600 text-white hover:bg-primary-600 dark:hover:bg-primary-700 hover:shadow-md'
              }`}
            >
              設計・調査依頼のテキスト生成
            </button>
          </div>

          {/* セクション2：実装フェーズ */}
          <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-all ${
            formData.phase === 'implementation'
              ? 'border-4 border-step2-500 dark:border-step2-400 bg-step2-50 dark:bg-step2-900/20 shadow-lg'
              : 'border-2 border-step2-200 dark:border-step2-800 opacity-60'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                実装フェーズ（STEP 2）
              </h2>
              {formData.phase === 'implementation' && (
                <span className="px-3 py-1 bg-step2-500 dark:bg-step2-600 text-white text-sm font-semibold rounded-full">
                  選択中
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              何をどう作るかが決まっており、手を動かせば完成する状態
            </p>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">進める条件：</p>
              <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside space-y-1">
                <li>要件が確定している</li>
                <li>要件定義書URLがある（最新版/承認済）</li>
                <li>追加確認なしで着手できる</li>
              </ul>
            </div>
            <button
              onClick={() => {
                handleFormChange({ ...formData, phase: 'implementation' });
                scrollToForm();
              }}
              className={`px-4 py-2 rounded-md transition-all font-medium shadow-sm ${
                formData.phase === 'implementation'
                  ? 'bg-step2-600 dark:bg-step2-500 text-white hover:bg-step2-700 dark:hover:bg-step2-600 shadow-md'
                  : 'bg-step2-500 dark:bg-step2-600 text-white hover:bg-step2-600 dark:hover:bg-step2-700 hover:shadow-md'
              }`}
            >
              実装依頼のテキスト生成
            </button>
          </div>
        </div>

        {/* 2カラムレイアウト */}
        <div id="form-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左：入力フォーム */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            {/* 現在のフェーズ表示 */}
            <div className={`mb-6 p-4 rounded-lg border-2 ${
              formData.phase === 'design_survey'
                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700'
                : 'bg-step2-50 dark:bg-step2-900/20 border-step2-300 dark:border-step2-700'
            }`}>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${
                  formData.phase === 'design_survey'
                    ? 'text-primary-700 dark:text-primary-300'
                    : 'text-step2-700 dark:text-step2-300'
                }`}>
                  {formData.phase === 'design_survey' ? 'STEP 1' : 'STEP 2'}
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {formData.phase === 'design_survey' ? '設計・調査フェーズ' : '実装フェーズ'}のフォーム
                </span>
              </div>
            </div>
            <Suspense fallback={
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            }>
              <Form data={formData} errors={errors} onChange={handleFormChange} />
            </Suspense>
          </div>

          {/* 右：生成結果プレビュー（固定表示） */}
          <div className="lg:sticky lg:top-4 self-start">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <Suspense fallback={
                <div className="animate-pulse space-y-4">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>
              }>
                <Output 
                slackText={slackText} 
                backlogText={backlogText}
                backlogDesignText={backlogDesignText}
                backlogImplementationText={backlogImplementationText}
                phase={formData.phase}
                onGenerate={handleGenerate}
                onReset={handleReset}
                hasErrors={hasErrors}
                isDesignDecisionMissing={isDesignDecisionMissing}
                />
              </Suspense>
            </div>
          </div>
        </div>
        
        <AppFooter useTailwind={true} className="mt-12">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            本ツールは、実装依頼内容を効率的に生成することを目的としています
          </p>
        </AppFooter>
      </div>
    </main>
  );
}
