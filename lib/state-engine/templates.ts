/**
 * 生成テキスト用テンプレート（固定テンプレ、LLM不要）
 * - 依頼元・端末・現象・比較・依頼内容は内部キーではなくラベルで出力
 * - Backlog記法（見出し * / **、箇条書き -）。リンクはURLをそのまま記載
 * @see https://support-ja.backlog.com/hc/ja/articles/360035641594
 */

import type { State0Values } from './types';
import type { FieldDef } from './types';

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

export function buildInvestigationOutput(
  state0: State0Values,
  state1Values: FormValues,
  fieldsById?: Record<string, FieldDef>
): string {
  const originDef = fieldsById?.origin;
  const deviceDef = fieldsById?.device;
  const requestIntentDef = fieldsById?.request_intent;
  const askTypeDef = fieldsById?.ask_type;

  const lines: string[] = [
    '* 原因確認依頼',
    '** 概要',
    `- 対象：${state0.target_url ? backlogUrl(state0.target_url) : '（未入力）'}`,
    `- 依頼の種類：${valueToLabel(requestIntentDef, state0.request_intent)}`,
    `- 依頼元：${valueToLabel(originDef, state0.origin)}`,
    `- 端末：${valueToLabel(deviceDef, state0.device)}`,
    ...(state0.phenomenon_note
      ? [`- 現在の挙動（補足）：${plainBlock(state0.phenomenon_note)}`]
      : []),
    `- 依頼内容：${valueToLabel(askTypeDef, state0.ask_type)}`,
    `- 期限：${str(state0.deadline) || '未定'}`,
    ...(state0.attachments ? [`- 参考：${plainBlock(state0.attachments)}`] : []),
    '** 再現手順・挙動',
    state1Values.repro_steps
      ? (toBacklogList(plainBlock(str(state1Values.repro_steps))) || '- （未入力）')
      : '- （未入力）',
    `- 現在の挙動：${plainBlock(str(state1Values.current_behavior)) || '（未入力）'}`,
    `- 期待する挙動：${plainBlock(str(state1Values.expected_behavior)) || '（未入力）'}`,
    ...(state1Values.spec_source
      ? ['', `- 根拠（分かる範囲）：${plainBlock(str(state1Values.spec_source))}`]
      : []),
    ...(state1Values.impact_scope
      ? ['', `- 影響範囲（分かる範囲）：${plainBlock(str(state1Values.impact_scope))}`]
      : []),
    '** 依頼事項（調査してほしいこと）',
    '上記のとおり、原因の切り分け（仕様か不具合か）および必要な対応方針の整理をお願いします。',
  ];
  return lines.filter((line) => line !== undefined).join('\n');
}

export function buildImplementationOutput(
  state0: State0Values,
  state2Values: FormValues,
  fieldsById?: Record<string, FieldDef>
): string {
  const originDef = fieldsById?.origin;
  const deviceDef = fieldsById?.device;
  const requestIntentDef = fieldsById?.request_intent;
  const askTypeDef = fieldsById?.ask_type;

  const reqUrl = str(state2Values.req_url_spec);

  const lines: string[] = [
    '* 修正依頼',
    '** 概要',
    `- 対象：${state0.target_url ? backlogUrl(state0.target_url) : '（未入力）'}`,
    `- 要件URL：${reqUrl ? backlogUrl(reqUrl) : '（未入力）'}`,
    `- 依頼の種類：${valueToLabel(requestIntentDef, state0.request_intent)}`,
    `- 依頼元：${valueToLabel(originDef, state0.origin)}`,
    `- 端末：${valueToLabel(deviceDef, state0.device)}`,
    ...(state0.phenomenon_note
      ? [`- 現在の挙動（補足）：${plainBlock(state0.phenomenon_note)}`]
      : []),
    `- 依頼内容：${valueToLabel(askTypeDef, state0.ask_type)}`,
    `- 期限：${str(state0.deadline) || '未定'}`,
    ...(state0.attachments ? [`- 参考：${plainBlock(state0.attachments)}`] : []),
    '** 完了条件・確認観点',
    `- 完了条件：${plainBlock(str(state2Values.done_definition)) || '（未入力）'}`,
    ...(state2Values.qa_points
      ? [`- 確認観点：${plainBlock(str(state2Values.qa_points))}`]
      : []),
    '** 依頼事項（修正してほしいこと）',
    '上記の要件・完了条件に基づき、修正の反映をお願いします。',
  ];
  return lines.filter((line) => line !== undefined).join('\n');
}

export function buildDirectorSummary(
  state0: State0Values,
  fieldsById?: Record<string, FieldDef>
): string {
  const originDef = fieldsById?.origin;
  const deviceDef = fieldsById?.device;
  const requestIntentDef = fieldsById?.request_intent;
  const askTypeDef = fieldsById?.ask_type;

  const lines: string[] = [
    `- 対象：${state0.target_url ? backlogUrl(state0.target_url) : ''}`,
    `- 依頼の種類：${valueToLabel(requestIntentDef, state0.request_intent)}`,
    `- 依頼元：${valueToLabel(originDef, state0.origin)} / 端末：${valueToLabel(deviceDef, state0.device)}`,
    ...(state0.phenomenon_note ? [`- 現在の挙動（補足）：${plainBlock(state0.phenomenon_note)}`] : []),
    `- 依頼内容：${valueToLabel(askTypeDef, state0.ask_type)}`,
    ...(state0.deadline ? [`- 期限：${str(state0.deadline)}`] : []),
  ];
  return lines.filter(Boolean).join('\n');
}
