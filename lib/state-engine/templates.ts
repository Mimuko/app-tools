/**
 * 生成テキスト用テンプレート（固定テンプレ、LLM不要）
 * - 依頼元・端末・現象・比較・依頼内容は内部キーではなくラベルで出力
 * - Backlog記法（見出し * / **、箇条書き -）。リンクはURLをそのまま記載
 * @see https://support-ja.backlog.com/hc/ja/articles/360035641594
 */

import type { State0Values } from './types';
import type { FieldDef } from './types';
import type { RequestTypeFormValues } from '@/lib/request-type-form';

type FormValues = Record<string, string | string[]>;

function str(v: unknown): string {
  if (v == null) return '';
  if (Array.isArray(v)) return v.filter(Boolean).join(', ');
  return String(v).trim();
}

/** フィールド定義と値（単一または配列）から表示ラベルを取得 */
function valueToLabel(def: FieldDef | undefined, value: string | string[]): string {
  if (!def || !def.options.length) return str(value);
  const arr = Array.isArray(value) ? value : value ? [value] : [];
  const labels = arr
    .map((v) => def.options.find((o) => o.value === v)?.label ?? v)
    .filter(Boolean);
  return labels.join('、');
}

/**
 * 「〜をお願いします」に続けて自然な文言に変換する。
 * 選択肢ラベルが「〜がほしい」等で終わる場合は、ここで別表現にマッピングする。
 */
const REQUEST_PHRASE_BY_ASK_TYPE: Record<string, string> = {
  investigate: '原因の確認',
  confirm_spec: '仕様の確認',
  estimate_fix: '修正工数の算出',
  fix_request: '修正の反映',
  rollback_check: '元に戻せるか確認',
};

function toRequestPhraseList(askType: string | string[], askTypeDef?: FieldDef): string {
  const arr = Array.isArray(askType) ? askType : askType ? [askType] : [];
  const phrases = arr
    .map((v) => REQUEST_PHRASE_BY_ASK_TYPE[v] ?? askTypeDef?.options.find((o) => o.value === v)?.label ?? v)
    .filter(Boolean);
  return phrases.join('、');
}

/** URL・テキストをそのまま返す（リンクはURL形式のまま記載） */
function backlogUrl(s: string): string {
  return String(s).trim();
}

/** 複数行テキストを Backlog の箇条書きに（行ごとに - を付与） */
function toBacklogList(text: string): string {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return '';
  return lines.map((l) => `- ${l}`).join('\n');
}

/** 長いテキストをそのまま（URLはリンク化しない、改行は維持） */
function plainBlock(s: string): string {
  return String(s).trim();
}

/** 複数行の場合はコロン後に改行、1行の場合はコロン後に続ける。箇条書き用に配列で返す */
function bulletLine(label: string, value: string): string[] {
  const v = String(value ?? '').trim();
  if (!v) return [`- ${label}：（未入力）`];
  if (v.includes('\n')) {
    return [`- ${label}：`, ...v.split(/\r?\n/)];
  }
  return [`- ${label}：${v}`];
}

export function buildInvestigationOutput(
  state0: State0Values,
  state1Values: FormValues,
  fieldsById?: Record<string, FieldDef>
): string {
  const consultationTypeDef = fieldsById?.consultation_type;
  const requestIntentDef = fieldsById?.request_intent;
  const askTypeDef = fieldsById?.ask_type;

  const requestIntentLabel =
    state0.consultation_type === 'spec_check' && !str(state0.request_intent)
      ? (valueToLabel(consultationTypeDef, 'spec_check') || '仕様かどうか確認したい')
      : valueToLabel(requestIntentDef, state0.request_intent);
  const requestPhraseList = toRequestPhraseList(state0.ask_type, askTypeDef);

  const reproSteps = str(state0.repro_steps) || str(state1Values.repro_steps);
  const reproEnv = str(state0.repro_env) || str(state1Values.repro_env);
  const currentBehavior = str(state0.current_behavior) || str(state1Values.current_behavior);
  const expectedBehavior = str(state0.expected_behavior) || str(state1Values.expected_behavior);

  const lines: string[] = [
    '* 原因確認依頼',
    '** 依頼種別',
    '- 原因確認',
    '',
    '** お願いしたいこと',
    requestIntentLabel
      ? `${requestIntentLabel}ため、${requestPhraseList || '（依頼内容未選択）'}をお願いします。`
      : (requestPhraseList ? `以下をお願いします：${requestPhraseList}` : '（依頼内容未選択）'),
    '',
    '** 概要',
    `- 相談タイプ：${valueToLabel(consultationTypeDef, state0.consultation_type) || '（未選択）'}`,
    `- 今回の変更・対応内容：${state0.consultation_type === 'spec_check' && !str(state0.request_intent) ? (valueToLabel(consultationTypeDef, 'spec_check') || '仕様かどうか確認したい') : (valueToLabel(requestIntentDef, state0.request_intent) || '（未選択）')}`,
    `- 今欲しい対応：${valueToLabel(askTypeDef, state0.ask_type) || '（未選択）'}`,
    `- 対象：${state0.target_url ? backlogUrl(state0.target_url) : '（未入力）'}`,
    ...(str(state0.attachments) ? bulletLine('参考', str(state0.attachments)) : []),
    '** 再現手順・挙動',
    reproSteps ? (toBacklogList(plainBlock(reproSteps)) || '- （未入力）') : '- （未入力）',
    ...bulletLine('再現環境（ブラウザ・OS・本番/STG環境）', reproEnv),
    ...bulletLine('現在の挙動', currentBehavior),
    ...bulletLine('期待する挙動', expectedBehavior),
    ...(state1Values.spec_source
      ? ['', ...bulletLine('根拠（分かる範囲）', str(state1Values.spec_source))]
      : []),
    ...(state1Values.impact_scope
      ? ['', ...bulletLine('影響範囲（分かる範囲）', str(state1Values.impact_scope))]
      : []),
  ];
  return lines.filter((line) => line !== undefined).join('\n');
}

export function buildImplementationOutput(
  state0: State0Values,
  state2Values: FormValues,
  fieldsById?: Record<string, FieldDef>
): string {
  const consultationTypeDef = fieldsById?.consultation_type;
  const requestIntentDef = fieldsById?.request_intent;
  const askTypeDef = fieldsById?.ask_type;

  const reqUrl = str(state2Values.req_url_spec);

  const requestIntentLabel =
    state0.consultation_type === 'spec_check' && !str(state0.request_intent)
      ? (valueToLabel(consultationTypeDef, 'spec_check') || '仕様かどうか確認したい')
      : valueToLabel(requestIntentDef, state0.request_intent);
  const requestPhraseList = toRequestPhraseList(state0.ask_type, askTypeDef);

  const lines: string[] = [
    '* 修正依頼',
    '** 依頼種別',
    '- 修正依頼',
    '',
    '** お願いしたいこと',
    requestIntentLabel
      ? `${requestIntentLabel}ため、${requestPhraseList || '（依頼内容未選択）'}をお願いします。`
      : (requestPhraseList ? `以下をお願いします：${requestPhraseList}` : '（依頼内容未選択）'),
    '',
    '** 概要',
    `- 相談タイプ：${valueToLabel(consultationTypeDef, state0.consultation_type) || '（未選択）'}`,
    `- 今回の変更・対応内容：${state0.consultation_type === 'spec_check' && !str(state0.request_intent) ? (valueToLabel(consultationTypeDef, 'spec_check') || '仕様かどうか確認したい') : (valueToLabel(requestIntentDef, state0.request_intent) || '（未選択）')}`,
    `- 今欲しい対応：${valueToLabel(askTypeDef, state0.ask_type) || '（未選択）'}`,
    `- 対象：${state0.target_url ? backlogUrl(state0.target_url) : '（未入力）'}`,
    `- 要件URL：${reqUrl ? backlogUrl(reqUrl) : '（未入力）'}`,
    ...(str(state0.attachments) ? bulletLine('参考', str(state0.attachments)) : []),
    '** 完了条件・確認観点',
    ...bulletLine('完了条件', str(state2Values.done_definition)),
    ...(state2Values.qa_points
      ? bulletLine('確認観点', str(state2Values.qa_points))
      : []),
  ];
  return lines.filter((line) => line !== undefined).join('\n');
}

/** 依頼タイプ別フォーム用：要件整理 / 要件定義の出力（Backlog記法・既存テイストに統一） */
export function buildRequirementOutput(values: RequestTypeFormValues): string {
  const s = (v: string) => String(v ?? '').trim();
  const typeLabel =
    values.include_client_negotiation === 'yes'
      ? '要件整理 / 要件定義（クライアント折衝含む）'
      : '要件整理 / 要件定義';
  const summaryText = s(values.summary);
  const requestPhrase = summaryText
    ? `${summaryText}のため、要件整理・相談をお願いします。`
    : '要件整理・相談をお願いします。';
  const lines: string[] = [
    '* 要件整理依頼',
    '** 依頼種別',
    `- ${typeLabel}`,
    '',
    '** お願いしたいこと',
    requestPhrase,
    '',
    '** 概要',
    `- 案件名：${s(values.project_name) || '（未入力）'}`,
    `- 対象：${s(values.target_url) ? backlogUrl(s(values.target_url)) : '（未入力）'}`,
    ...bulletLine('依頼内容', summaryText),
    ...bulletLine('背景 / 目的', s(values.background)),
    ...bulletLine('今の状況', s(values.current_state)),
    ...bulletLine('変更理由', s(values.change_reason)),
    ...bulletLine('未確定事項', s(values.undecided_items)),
    ...bulletLine('影響範囲', s(values.impact_scope)),
    ...bulletLine('クライアント確認が必要なこと', s(values.client_confirmation)),
    `- 期限：${s(values.deadline) || '（未入力）'}`,
    `- 優先度：${s(values.priority) || '（未入力）'}`,
    `- 関係者：${s(values.stakeholders) || '（未入力）'}`,
  ];
  return lines.filter((line) => line !== undefined).join('\n');
}

/** 依頼タイプ別フォーム用：制作進行の出力（Backlog記法・既存テイストに統一） */
export function buildProductionOutput(values: RequestTypeFormValues): string {
  const s = (v: string) => String(v ?? '').trim();
  const summaryText = s(values.summary);
  const implContent = s(values.implementation_content);
  const requestPhrase = summaryText
    ? `${summaryText}のため、実装をお願いします。`
    : '実装をお願いします。';
  const lines: string[] = [
    '* 制作進行依頼',
    '** 依頼種別',
    '- 制作進行',
    '',
    '** お願いしたいこと',
    requestPhrase,
    '',
    '** 概要',
    `- 案件名：${s(values.project_name) || '（未入力）'}`,
    `- 対象：${s(values.target_url) ? backlogUrl(s(values.target_url)) : '（未入力）'}`,
    ...bulletLine('依頼内容', summaryText),
    ...bulletLine('背景 / 目的', s(values.background)),
    ...bulletLine('確定済み仕様', s(values.fixed_spec)),
    `- デザイン / 仕様資料：${s(values.design_spec_url) ? backlogUrl(s(values.design_spec_url)) : '（未入力）'}`,
    ...bulletLine('実装内容', implContent),
    `- 担当制作会社：${s(values.production_company) || '（未入力）'}`,
    ...bulletLine('確認フロー', s(values.confirmation_flow)),
    `- リリース希望日：${s(values.release_wish_date) || '（未入力）'}`,
    `- 期限：${s(values.deadline) || '（未入力）'}`,
    `- 優先度：${s(values.priority) || '（未入力）'}`,
    `- 関係者：${s(values.stakeholders) || '（未入力）'}`,
  ];
  return lines.filter((line) => line !== undefined).join('\n');
}

export function buildDirectorSummary(
  state0: State0Values,
  fieldsById?: Record<string, FieldDef>
): string {
  const consultationTypeDef = fieldsById?.consultation_type;
  const requestIntentDef = fieldsById?.request_intent;
  const askTypeDef = fieldsById?.ask_type;

  const requestIntentDisplay =
    state0.consultation_type === 'spec_check' && !str(state0.request_intent)
      ? (valueToLabel(consultationTypeDef, 'spec_check') || '仕様かどうか確認したい')
      : valueToLabel(requestIntentDef, state0.request_intent);

  const lines: string[] = [
    `- 対象：${state0.target_url ? backlogUrl(state0.target_url) : ''}`,
    `- 相談タイプ：${valueToLabel(consultationTypeDef, state0.consultation_type)}`,
    `- 今回の変更・対応内容：${requestIntentDisplay}`,
    `- 今欲しい対応：${valueToLabel(askTypeDef, state0.ask_type)}`,
  ];
  return lines.filter(Boolean).join('\n');
}
