'use client';

import { FormSection } from './FormSection';
import type { FormData, ValidationErrors } from '@/types/form';
import { isVisible, shouldShowWarning } from '@/lib/visibility';

interface FormProps {
  data: FormData;
  errors: ValidationErrors;
  onChange: (data: FormData) => void;
}

export function Form({ data, errors, onChange }: FormProps) {
  const handleChange = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const handleArrayChange = (
    field: keyof FormData,
    value: string,
    checked: boolean
  ) => {
    const current = (data[field] as string[]) || [];
    if (checked) {
      onChange({ ...data, [field]: [...current, value] as FormData[typeof field] });
    } else {
      onChange({
        ...data,
        [field]: current.filter((v) => v !== value) as FormData[typeof field],
      });
    }
  };

  const hasSectionError = (fields: (keyof FormData)[]): boolean => {
    return fields.some((field) => errors[field] && isVisible(field, data));
  };

  const warnings = shouldShowWarning(data);

  return (
    <form className="space-y-6">
      {/* A. 案件概要 */}
      <FormSection
        title="案件概要"
        hasError={hasSectionError(['projectName', 'purposeKPI', 'targetScope'])}
      >
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            案件名 <span className="text-red-500 dark:text-red-400 dark:text-red-400">*</span>
          </label>
          <input
            type="text"
            value={data.projectName}
            onChange={(e) => handleChange('projectName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            目的/KPI <span className="text-red-500 dark:text-red-400 dark:text-red-400">*</span>
          </label>
          <textarea
            value={data.purposeKPI}
            onChange={(e) => handleChange('purposeKPI', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            対象範囲（対象URL） <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <textarea
            value={data.targetScope}
            onChange={(e) => handleChange('targetScope', e.target.value)}
            rows={3}
            placeholder="例：https://www.google.com/"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            今回対応しない範囲
          </label>
          <textarea
            value={data.excludedScope || ''}
            onChange={(e) => handleChange('excludedScope', e.target.value)}
            rows={2}
            placeholder="例：https://www.google.com/"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </FormSection>

      {/* B. 環境・前提 */}
      <FormSection
        title="環境・前提"
        hasError={hasSectionError(['cms', 'existingModulePolicy'])}
      >
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            使用CMS <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <select
            value={data.cms}
            onChange={(e) => handleChange('cms', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="HubSpot">HubSpot</option>
            <option value="WordPress">WordPress</option>
            <option value="その他">その他</option>
          </select>
        </div>
        {isVisible('theme', data) && (
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">使用テーマ名</label>
            <input
              type="text"
              value={data.theme || ''}
              onChange={(e) => handleChange('theme', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        )}
        {isVisible('existingModulePolicy', data) && (
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
              既存モジュール利用方針 <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <select
              value={data.existingModulePolicy}
              onChange={(e) => handleChange('existingModulePolicy', e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="既存優先">既存優先</option>
              <option value="新規あり">新規あり</option>
              <option value="未定">未定</option>
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            触って良い範囲
          </label>
          <textarea
            value={data.touchableRange || ''}
            onChange={(e) => handleChange('touchableRange', e.target.value)}
            rows={4}
            placeholder={`例：
・既存モジュール「Hero」「CTA」「FAQ」は複製して改修してOK
・CSSは子テーマ内での追記・上書きのみ可
・管理画面（Style Settings）での色・フォント調整は可
・TOPページ内の静的テキスト差し替えは可`}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            触れない範囲
          </label>
          <textarea
            value={data.untouchableRange || ''}
            onChange={(e) => handleChange('untouchableRange', e.target.value)}
            rows={4}
            placeholder={`例：
・親テーマ（CLEAN）の直接編集は禁止
・既存共通モジュールの構造変更は不可
・他ページへ影響が出るグローバルCSSの変更は禁止
・既存ブログ／導入事例のデータ構造変更は不可`}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </FormSection>

      {/* C. 制約・方針 */}
      <FormSection
        title="制約・方針"
        hasError={hasSectionError(['constraintStatus', 'constraintNextAction'])}
      >
        {warnings.constraintUnknown && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 rounded-md mb-4">
            <p className="text-red-800 dark:text-red-200 font-semibold">
              ⚠ 制約未整理のまま着手すると手戻りが発生します
            </p>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            CMS制約の把握状況 <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <select
            value={data.constraintStatus}
            onChange={(e) => handleChange('constraintStatus', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="known">把握している</option>
            <option value="partial">一部把握</option>
            <option value="unknown">把握していない</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">制約内容</label>
          <textarea
            value={data.constraintContent || ''}
            onChange={(e) => handleChange('constraintContent', e.target.value)}
            rows={6}
            placeholder={`例：
・HubSpot有料テーマ（CLEAN）を使用しており、親テーマの編集は不可
・クライアント側で更新する想定のため、CSS固定は最小限にしたい
・納品後は社内運用を想定しており、複雑な操作は避けたい
・リッチテキストモジュール内のHTML構造は固定
・実装者が設計判断を引き取らない前提で進行する
※制約は「できないこと・難しい理由」を正直に記載してください。`}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        {isVisible('constraintNextAction', data) && (
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
              制約確認の担当/期限 <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              type="text"
              value={data.constraintNextAction || ''}
              onChange={(e) => handleChange('constraintNextAction', e.target.value)}
              placeholder="例：ディレクターが本日中に確認"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            難しい箇所の対応方針
          </label>
          <select
            value={data.difficultAreaPolicy}
            onChange={(e) => handleChange('difficultAreaPolicy', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="近似">近似</option>
            <option value="後回し">後回し</option>
            <option value="スコープ外">スコープ外</option>
            <option value="相談して決めたい">相談して決めたい</option>
          </select>
        </div>
      </FormSection>

      {/* D. デザインの関与方針（検討）- 設計・調査フェーズ専用 */}
      {data.phase === 'design_survey' && (
        <FormSection
          title="デザインの関与方針（検討）"
          hasError={hasSectionError(['designInvolvementPolicy'])}
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            この項目は、設計・調査フェーズにおいて、デザイン作成やデザイン判断が必要かどうかを整理するためのものです。
          </p>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
              デザインの関与方針 <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <select
              value={data.designInvolvementPolicy || ''}
              onChange={(e) => handleChange('designInvolvementPolicy', e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">選択してください</option>
              <option value="design_judgment_needed">デザイン要否を含めて判断してほしい</option>
              <option value="existing_tone_judgment">既存トンマナを前提に、設計判断してほしい</option>
              <option value="no_design_judgment">デザイン判断は不要（仕様固定前提）</option>
            </select>
          </div>

          {/* 選択肢の説明文 */}
          {data.designInvolvementPolicy === 'design_judgment_needed' && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-4">
              デザイン作成が必要かどうかを含めて、構成や既存状況を踏まえた判断を依頼します。
            </p>
          )}
          {data.designInvolvementPolicy === 'existing_tone_judgment' && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-4">
              既存のデザインやUIを前提に、踏襲・調整の要否の判断を依頼します。
            </p>
          )}
          {data.designInvolvementPolicy === 'no_design_judgment' && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-4">
              デザイン判断は不要で、仕様や構成のみの検討を希望します。
            </p>
          )}

          {/* 参考情報（任意）- design_judgment_needed または existing_tone_judgment の場合 */}
          {(data.designInvolvementPolicy === 'design_judgment_needed' ||
            data.designInvolvementPolicy === 'existing_tone_judgment') && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                参考情報
              </label>
              <textarea
                value={data.designJudgmentReference || ''}
                onChange={(e) => handleChange('designJudgmentReference', e.target.value)}
                rows={4}
                placeholder={
                  data.designInvolvementPolicy === 'design_judgment_needed'
                    ? '判断の参考になりそうな情報や背景があれば記載してください。'
                    : '既存ページURL、利用中のモジュール、デザインガイドラインなど判断の基準となるものを記載してください。'
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          )}
        </FormSection>
      )}

      {/* D. デザインの関与範囲 - 実装フェーズ専用 */}
      {data.phase === 'implementation' && (
        <FormSection
          title="デザインの関与範囲"
          hasError={hasSectionError([
            'designRole',
            'implementationPriority',
            'exceptionAllowed',
            'exceptionDecisionOwner',
            'figmaBaseFrameUrl',
            'existingDesignReference',
          ])}
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            本実装で採用するデザインの関与範囲を選択してください。
          </p>
          <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            デザインの関与範囲 <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <select
            value={data.designRole}
            onChange={(e) => handleChange('designRole', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="design_creation">デザイン作成あり</option>
            <option value="existing_tone">既存トンマナを踏襲して実装（デザイン作成なし）</option>
            <option value="spec_fixed">デザイン判断なし（仕様固定）</option>
          </select>
        </div>

        {/* 選択肢の説明文 */}
        {data.designRole === 'design_creation' && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-4">
            新規デザイン作成、または既存デザインの調整・検討を含みます。
          </p>
        )}
        {data.designRole === 'existing_tone' && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-4">
            新規デザイン制作は行わず、既存サイトのデザイン・UIルールを前提に実装を行います。
          </p>
        )}
        {data.designRole === 'spec_fixed' && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-4">
            見た目やデザインについての判断は行わず、あらかじめ決まっている仕様どおりに実装します。
          </p>
        )}

        {/* existing_toneの場合：既存デザインの参照元 */}
        {isVisible('existingDesignReference', data) && (
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
              既存デザインの参照元
            </label>
            <textarea
              value={data.existingDesignReference || ''}
              onChange={(e) => handleChange('existingDesignReference', e.target.value)}
              rows={4}
              placeholder={`例：
・参考ページURL
・既存コンポーネント / モジュール名
・スタイルガイド / Figma URL（あれば）`}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              ※未入力でも生成可能ですが、入力することを推奨します
            </p>
          </div>
        )}

        {/* design_creation の場合 */}
        {isVisible('implementationPriority', data) && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                実装優先要素 <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <div className="space-y-2">
                {[
                  'レイアウト',
                  '幅',
                  '画像サイズ感',
                  '見出しサイズ',
                  'カラー',
                  'フォント',
                  '装飾',
                ].map((item) => (
                  <label key={item} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={
                        (data.implementationPriority || []).includes(item as any)
                      }
                      onChange={(e) =>
                        handleArrayChange('implementationPriority', item, e.target.checked)
                      }
                      className="mr-2"
                    />
                    <span className="text-gray-900 dark:text-gray-100">{item}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                参考レベル要素
              </label>
              <div className="space-y-2">
                {['カラー', '英字フォント', '背景', '装飾'].map((item) => (
                  <label key={item} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(data.referenceLevel || []).includes(item as any)}
                      onChange={(e) =>
                        handleArrayChange('referenceLevel', item, e.target.checked)
                      }
                      className="mr-2"
                    />
                    <span className="text-gray-900 dark:text-gray-100">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {/* spec_fixed の場合 */}
        {isVisible('exceptionAllowed', data) && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                差分許容の例外項目 <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <div className="space-y-2">
                {['色', 'フォント', '装飾', '画像比率', '細かい余白', 'hover等'].map(
                  (item) => (
                    <label key={item} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={(data.exceptionAllowed || []).includes(item as any)}
                        onChange={(e) =>
                          handleArrayChange('exceptionAllowed', item, e.target.checked)
                        }
                        className="mr-2"
                      />
                      <span className="text-gray-900 dark:text-gray-100">{item}</span>
                    </label>
                  )
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                例外の補足テキスト
              </label>
              <textarea
                value={data.exceptionNote || ''}
                onChange={(e) => handleChange('exceptionNote', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                差分が出た場合の判断者 <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <select
                value={data.exceptionDecisionOwner || ''}
                onChange={(e) =>
                  handleChange('exceptionDecisionOwner', e.target.value as any)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">選択してください</option>
                <option value="ディレクター（一次判断）">ディレクター（一次判断）</option>
                <option value="クライアント（ディレクター経由で確認）">クライアント（ディレクター経由で確認）</option>
                <option value="未定（※着手前に確定必須）">未定（※着手前に確定必須）</option>
              </select>
              {/* 実装フェーズで判断者が未定の場合のアラート */}
              {data.phase === 'implementation' &&
                (data.designRole === 'existing_tone' || data.designRole === 'spec_fixed') &&
                data.exceptionDecisionOwner === '未定（※着手前に確定必須）' && (
                  <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 rounded-md">
                    <p className="text-red-800 dark:text-red-200 text-sm">
                      ⚠ デザイン差分が発生した場合の判断者が未定です。
                    </p>
                    <p className="text-red-800 dark:text-red-200 text-sm mt-1">
                      実装着手前に判断者を確定する必要があります。
                    </p>
                    <p className="text-red-800 dark:text-red-200 text-sm mt-1">
                      確定後に実装依頼を進めてください。
                    </p>
                  </div>
                )}
            </div>
          </>
        )}

        {/* design_creation, existing_tone の場合 */}
        {isVisible('figmaBaseFrameUrl', data) && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                Figmaの基準フレームURL <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <input
                type="url"
                value={data.figmaBaseFrameUrl || ''}
                onChange={(e) => handleChange('figmaBaseFrameUrl', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  errors.figmaBaseFrameUrl
                    ? 'border-red-500 dark:border-red-400'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.figmaBaseFrameUrl && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  {data.figmaBaseFrameUrl?.trim() === ''
                    ? '必須項目です'
                    : '有効なURLを入力してください（http:// または https:// で始まる必要があります）'}
                </p>
              )}
            </div>
            {isVisible('figmaReferenceFrameUrl', data) && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                  参考フレームURL
                </label>
                <input
                  type="url"
                  value={data.figmaReferenceFrameUrl || ''}
                  onChange={(e) => handleChange('figmaReferenceFrameUrl', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                    errors.figmaReferenceFrameUrl
                      ? 'border-red-500 dark:border-red-400'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.figmaReferenceFrameUrl && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                    有効なURLを入力してください（http:// または https:// で始まる必要があります）
                  </p>
                )}
              </div>
            )}
            {isVisible('baseFrameNote', data) && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                  基準フレームの補足
                </label>
                <textarea
                  value={data.baseFrameNote || ''}
                  onChange={(e) => handleChange('baseFrameNote', e.target.value)}
                  rows={2}
                  placeholder="どのセクション/フレームか"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            )}
          </>
        )}
        </FormSection>
      )}

      {/* E. コンテンツの静的/動的方針 */}
      <FormSection
        title="コンテンツの静的/動的方針"
        hasError={hasSectionError([
          'contentRendering',
          'dataSourceSpec',
          'dataOwner',
          'displayRule',
          'futureDynamicPossible',
          'futureDynamicCondition',
        ])}
      >
        {warnings.contentUndecided && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 rounded-md mb-4">
            <p className="text-red-800 dark:text-red-200 font-semibold">
              ⚠ コンテンツ表示方針（静的/動的）が未定のため、手戻りリスクがあります
            </p>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            コンテンツの静的/動的方針 <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <select
            value={data.contentRendering}
            onChange={(e) => handleChange('contentRendering', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="static_ok">静的でOK</option>
            <option value="dynamic_required">動的実装が必要</option>
            <option value="dynamic_later">次フェーズで動的化</option>
            <option value="undecided">未定</option>
          </select>
        </div>

        {/* dynamic_required or dynamic_later の場合 */}
        {isVisible('dataSourceSpec', data) && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                データ元（正） <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <textarea
                value={data.dataSourceSpec || ''}
                onChange={(e) => handleChange('dataSourceSpec', e.target.value)}
                rows={3}
                placeholder="例：FAQページ/ブログ/導入事例一覧"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                更新担当 <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <select
                value={data.dataOwner || '未定'}
                onChange={(e) => handleChange('dataOwner', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="クライアント">クライアント</option>
                <option value="社内">社内</option>
                <option value="未定">未定</option>
              </select>
            </div>
            {/* 表示条件（件数・並び順・絞り込み） */}
            {isVisible('displayRule', data) ? (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                  表示条件（補足）
                </label>
                {data.phase === 'design_survey' ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    本項目は、実装に向けて検討が必要な表示条件を整理するためのものです。
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    表示条件（件数・並び順・絞り込み）は、原則として要件定義書に記載されている内容を前提とします。要件定義書に記載がない補足や、実装上の注意点があれば記載してください。
                  </p>
                )}
                {data.phase === 'design_survey' && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    この時点では確定せず、設計・調査フェーズでの論点整理として扱います。
                  </p>
                )}
                <textarea
                  value={data.displayRule || ''}
                  onChange={(e) => handleChange('displayRule', e.target.value)}
                  rows={3}
                  placeholder={`例：
・一覧は最新順で10件表示
・特定カテゴリのみ表示
・詳細な条件は要件定義書参照`}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            ) : data.phase === 'implementation' &&
              data.requirementConfirmed === 'not_confirmed' &&
              (data.contentRendering === 'dynamic_required' ||
                data.contentRendering === 'dynamic_later') ? (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700 rounded-md">
                <p className="text-yellow-800 dark:text-yellow-200 mb-3">
                  表示条件（件数・並び順・絞り込み）は、要件定義・設計フェーズで決定する内容です。
                </p>
                <p className="text-yellow-800 dark:text-yellow-200 mb-3">
                  実装フェーズでは指定できません。
                </p>
                <button
                  type="button"
                  onClick={() => {
                    handleChange('phase', 'design_survey');
                    const formSection = document.getElementById('form-section');
                    if (formSection) {
                      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="px-4 py-2 bg-primary-500 dark:bg-primary-600 text-white rounded-md hover:bg-primary-600 dark:hover:bg-primary-700 transition-all font-medium shadow-sm hover:shadow-md"
                >
                  設計・調査フェーズへ移動
                </button>
              </div>
            ) : null}
            {isVisible('dynamicLaterTiming', data) && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                  動的化予定の時期/条件
                </label>
                <textarea
                  value={data.dynamicLaterTiming || ''}
                  onChange={(e) => handleChange('dynamicLaterTiming', e.target.value)}
                  rows={2}
                  placeholder="例：1月以降、記事数10件以上"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            )}
          </>
        )}

        {/* static_ok or undecided の場合 */}
        {isVisible('futureDynamicPossible', data) && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                将来的に動的化する可能性 <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <select
                value={data.futureDynamicPossible || '未定'}
                onChange={(e) =>
                  handleChange('futureDynamicPossible', e.target.value as any)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="あり">あり</option>
                <option value="なし">なし</option>
                <option value="未定">未定</option>
              </select>
            </div>
            {data.futureDynamicPossible === 'あり' && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                  将来動的化の条件・時期 <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <textarea
                  value={data.futureDynamicCondition || ''}
                  onChange={(e) =>
                    handleChange('futureDynamicCondition', e.target.value)
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            )}
          </>
        )}
      </FormSection>

      {/* 要件確定チェック（実装フェーズのみ） */}
      {data.phase === 'implementation' && (
        <FormSection
          title="要件確定チェック"
          hasError={hasSectionError(['requirementConfirmed', 'requirementDocumentUrl'])}
        >
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
              要件確定チェック <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <select
              value={data.requirementConfirmed || ''}
              onChange={(e) =>
                handleChange('requirementConfirmed', (e.target.value || undefined) as any)
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">選択してください</option>
              <option value="confirmed">要件が確定している</option>
              <option value="not_confirmed">要件が確定していない</option>
            </select>
          </div>

          {data.requirementConfirmed === 'confirmed' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                  要件定義書URL <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={data.requirementDocumentUrl || ''}
                  onChange={(e) => handleChange('requirementDocumentUrl', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                    errors.requirementDocumentUrl
                      ? 'border-red-500 dark:border-red-400'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.requirementDocumentUrl && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                    必須項目です（最新版/承認済の要件定義へのリンクを入力してください）
                  </p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  最新版/承認済の要件定義へのリンク（議事録ではなく確定版）
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                  版/最終更新日（任意）
                </label>
                <input
                  type="text"
                  value={data.requirementDocumentVersion || ''}
                  onChange={(e) => handleChange('requirementDocumentVersion', e.target.value)}
                  placeholder="例：v1.0 / 2024-01-01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </>
          )}

          {data.requirementConfirmed === 'not_confirmed' && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 rounded-md">
              <p className="text-red-800 dark:text-red-200 font-semibold mb-3">
                ⚠ 要件未確定のまま実装に進むと手戻り・追加工数の原因になります
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    handleChange('phase', 'design_survey');
                    const formSection = document.getElementById('form-section');
                    if (formSection) {
                      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="w-full px-4 py-2 bg-primary-500 dark:bg-primary-600 text-white rounded-md hover:bg-primary-600 dark:hover:bg-primary-700 transition-all font-medium shadow-sm hover:shadow-md"
                >
                  調査・設計を依頼する
                </button>
                <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                  または
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                  依頼元で要件定義を整備してから再提出してください
                </p>
              </div>
            </div>
          )}
        </FormSection>
      )}

      {/* F. 実装方針 */}
      <FormSection
        title="実装方針"
        hasError={hasSectionError([
          'implementationPolicy',
          'fixedTargets',
          'clientNonEditableNote',
          'acceptanceCriteria',
        ])}
      >
        {warnings.implementationTBD && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700 rounded-md mb-4">
            <p className="text-yellow-800 dark:text-yellow-200 font-semibold">⚠ 実装方針が未定</p>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            実装方針 <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <select
            value={data.implementationPolicy}
            onChange={(e) =>
              handleChange('implementationPolicy', e.target.value as any)
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="A">管理画面優先</option>
            <option value="B">CSS固定</option>
            <option value="MIX">混在</option>
            <option value="TBD">未定</option>
          </select>
        </div>

        {/* 設計・調査フェーズ時の補足文 */}
        {data.phase === 'design_survey' && (
          <div className="mt-2 mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              実装に向けて検討が必要な実装方針の候補を整理します。
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              この時点では最終決定ではありません。
            </p>
          </div>
        )}

        {/* 選択肢の説明文と向いているケース */}
        {data.implementationPolicy === 'A' && (
          <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-md">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              管理画面からの更新・運用を優先した実装方法です。
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              将来的な更新作業がしやすくなります。
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">向いているケース：</p>
            <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside space-y-1">
              <li>更新頻度が高い</li>
              <li>非エンジニアが運用する</li>
            </ul>
          </div>
        )}

        {data.implementationPolicy === 'B' && (
          <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-md">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              見た目を固定し、管理画面からは変更できない実装方法です。
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              デザイン崩れを防ぎたい場合に向いています。
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">向いているケース：</p>
            <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside space-y-1">
              <li>デザインを固定したい</li>
              <li>更新頻度が低い</li>
            </ul>
          </div>
        )}

        {data.implementationPolicy === 'MIX' && (
          <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-md">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              一部は管理画面から更新し、見た目のルールはCSSで制御する実装方法です。
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">向いているケース：</p>
            <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside space-y-1">
              <li>更新箇所と固定したい箇所が混在している</li>
              <li>運用とデザインの両立をしたい</li>
            </ul>
          </div>
        )}

        {data.implementationPolicy === 'TBD' && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              実装方針をこれから検討したい場合に選択してください。
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              設計・調査フェーズで整理します。
            </p>
          </div>
        )}
        {isVisible('adminChangeableRange', data) && (
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
              管理画面で変更できる前提の範囲
            </label>
            <textarea
              value={data.adminChangeableRange || ''}
              onChange={(e) => handleChange('adminChangeableRange', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        )}
        {isVisible('fixedTargets', data) && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                CSS固定する対象 <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <textarea
                value={data.fixedTargets || ''}
                onChange={(e) => handleChange('fixedTargets', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                クライアント側で変更できない点の説明方針{' '}
                <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <textarea
                value={data.clientNonEditableNote || ''}
                onChange={(e) =>
                  handleChange('clientNonEditableNote', e.target.value)
                }
                rows={2}
                placeholder="例：納品時に説明、合意済み 等"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </>
        )}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            受け入れ条件 <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          {data.phase === 'design_survey' ? (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              実装に進めるかどうかを判断するために、設計・調査フェーズで確認すべき観点を整理する項目です。
            </p>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              実装が完了したかどうかを判断するための基準です。確認したいポイントや、OKとする状態を記載してください。
            </p>
          )}
          <textarea
            value={data.acceptanceCriteria}
            onChange={(e) => handleChange('acceptanceCriteria', e.target.value)}
            rows={8}
            placeholder={
              data.phase === 'design_survey'
                ? `例：
・実装に進むために必要な要件が整理されている
・表示条件（件数／並び順／絞り込み）の決定方針が明確になっている
・影響範囲と対応方針が把握できている
・判断が必要な論点と決定者が明確になっている`
                : `例：
・レイアウト構造、情報の並び、コンテンツ量がデザインと一致している
・管理画面から想定通り更新できることが確認できている
・hover時の色や細かなアニメーションは再現不要
・STG環境での確認をもってOKとする
・社内確認のみでクライアント確認は行わない
・XX日までに指摘がなければ受け入れ完了とする`
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </FormSection>

      {/* G. 今回のリリース範囲・優先順位 */}
      <FormSection
        title="今回のリリース範囲・優先順位"
        hasError={hasSectionError(['releaseIncludedPages'])}
      >
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            リリースに含めるページ・機能 <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <textarea
            value={data.releaseIncludedPages}
            onChange={(e) => handleChange('releaseIncludedPages', e.target.value)}
            rows={4}
            placeholder={`例：・TOP
・製品特徴
・FAQ（静的）`}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            今回のリリースに含めないページ・機能
          </label>
          <textarea
            value={data.releaseExcludedPages || ''}
            onChange={(e) => handleChange('releaseExcludedPages', e.target.value)}
            rows={4}
            placeholder="例：・導入事例の動的化（1月予定）"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </FormSection>

      {/* H. スケジュール（実装フェーズのみ） */}
      {data.phase === 'implementation' && (
        <FormSection
          title="スケジュール"
          hasError={hasSectionError([
            'designFixDate',
            'implementationStartDate',
            'releaseDate',
          ])}
        >
        {isVisible('designFixDate', data) && (
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
              デザインFIX日 <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              type="date"
              value={data.designFixDate || ''}
              onChange={(e) => handleChange('designFixDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            実装着手OK日 <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            type="date"
            value={data.implementationStartDate}
            onChange={(e) =>
              handleChange('implementationStartDate', e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            社内確認期限
          </label>
          <input
            type="date"
            value={data.internalReviewDeadline || ''}
            onChange={(e) =>
              handleChange('internalReviewDeadline', e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            UAT/承認期限
          </label>
          <input
            type="date"
            value={data.uatDeadline || ''}
            onChange={(e) => handleChange('uatDeadline', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            リリース日 <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            type="date"
            value={data.releaseDate}
            onChange={(e) => handleChange('releaseDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            リリース日がマストの場合、その理由
          </label>
          <textarea
            value={data.releaseDateReason || ''}
            onChange={(e) => handleChange('releaseDateReason', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </FormSection>
      )}

      {/* I. 判断・連絡（実装フェーズのみ） */}
      {data.phase === 'implementation' && (
        <FormSection
          title="判断・連絡"
          hasError={hasSectionError([
            'decisionMaker',
            'implementationConsultant',
            'contactMethod',
          ])}
        >
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            判断責任者 <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            type="text"
            value={data.decisionMaker}
            onChange={(e) => handleChange('decisionMaker', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            実装相談先 <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            type="text"
            value={data.implementationConsultant}
            onChange={(e) =>
              handleChange('implementationConsultant', e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            連絡手段 <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <select
            value={data.contactMethod}
            onChange={(e) => handleChange('contactMethod', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="Slack">Slack</option>
            <option value="Backlog">Backlog</option>
            <option value="メール">メール</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            緊急時の連絡方針
          </label>
          <textarea
            value={data.emergencyContactPolicy || ''}
            onChange={(e) => handleChange('emergencyContactPolicy', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </FormSection>
      )}

      {/* J. 納品後の運用・マニュアル（実装フェーズのみ） */}
      {data.phase === 'implementation' && (
        <FormSection
          title="納品後の運用・マニュアル"
          hasError={hasSectionError([
            'manualPlan',
            'manualScope',
            'manualDeadline',
            'scheduleApproval',
            'updateOwner',
            'operationExplanation',
          ])}
        >
        {warnings.manualTBD && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700 rounded-md mb-4">
            <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
              ⚠ 納品後運用（操作説明/マニュアル）が未定
            </p>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            マニュアル作成方針 <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <select
            value={data.manualPlan}
            onChange={(e) => handleChange('manualPlan', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="director">ディレクター作成</option>
            <option value="implementer">実装側作成（要調整）</option>
            <option value="later">次フェーズ</option>
            <option value="tbd">未定</option>
          </select>
        </div>
        {isVisible('manualScope', data) && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                作成範囲 <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <textarea
                value={data.manualScope || ''}
                onChange={(e) => handleChange('manualScope', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                期限 <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <input
                type="date"
                value={data.manualDeadline || ''}
                onChange={(e) => handleChange('manualDeadline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                スケジュール合意の有無 <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <select
                value={data.scheduleApproval || ''}
                onChange={(e) => handleChange('scheduleApproval', (e.target.value || undefined) as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">選択してください</option>
                <option value="agreed">合意済</option>
                <option value="not_agreed">合意なし</option>
              </select>
            </div>
          </>
        )}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            更新担当 <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <select
            value={data.updateOwner}
            onChange={(e) => handleChange('updateOwner', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="クライアント">クライアント</option>
            <option value="社内">社内</option>
            <option value="未定">未定</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            操作説明 <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <select
            value={data.operationExplanation}
            onChange={(e) => handleChange('operationExplanation', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="リリース時資料納品">リリース時資料納品</option>
            <option value="オンライン説明">オンライン説明</option>
            <option value="次フェーズ">次フェーズ</option>
          </select>
        </div>
      </FormSection>
      )}

      {/* 設計・調査フェーズ用：スケジュール（目安） */}
      {data.phase === 'design_survey' && (
        <FormSection title="スケジュール（目安）" hasError={false}>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
              実装着手の希望時期
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              現時点での目安や希望があれば選択してください。設計内容により前後する可能性があります。
            </p>
            <input
              type="date"
              value={data.designImplementationStartDate || ''}
              onChange={(e) => handleChange('designImplementationStartDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </FormSection>
      )}

      {/* 設計・調査フェーズ用：判断・連絡 */}
      {data.phase === 'design_survey' && (
        <FormSection title="判断・連絡" hasError={false}>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
              仕様・技術判断
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              設計・調査中に判断が必要になった場合の判断者や判断方法を記載してください。
            </p>
            <input
              type="text"
              value={data.designSpecDecision || ''}
              onChange={(e) => handleChange('designSpecDecision', e.target.value)}
              placeholder="個人名を入力してください"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
              不明時の対応
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              判断が難しい場合や不明点が出た場合の連絡・対応方法を記載してください。
            </p>
            <textarea
              value={data.designUnclearResponse || ''}
              onChange={(e) => handleChange('designUnclearResponse', e.target.value)}
              rows={3}
              placeholder={`例：
Slackでメンションしてください！`}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </FormSection>
      )}

      {/* 設計・調査フェーズ用：納品後の運用・マニュアル（想定） */}
      {data.phase === 'design_survey' && (
        <FormSection title="納品後の運用・マニュアル（想定）" hasError={false}>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            実装後の運用やマニュアル対応について、現時点で想定していることがあれば記載してください。
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            未定でも問題ありません。
          </p>
          <textarea
            value={data.designManualPlan || ''}
            onChange={(e) => handleChange('designManualPlan', e.target.value)}
            rows={4}
            placeholder={`例：
・管理画面の簡易操作説明が必要
・マニュアル対応は不要
・実装内容確定後に判断したい`}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </FormSection>
      )}
    </form>
  );
}
