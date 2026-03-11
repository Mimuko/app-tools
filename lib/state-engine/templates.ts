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
  const reproSteps = str(state0.repro_steps);
  const reproEnv = str(state0.repro_env);
  const currentBehavior = str(state0.current_behavior);
  const expectedBehavior = str(state0.expected_behavior);
  const hasReproSection = reproSteps || reproEnv || currentBehavior || expectedBehavior;

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
    ...(hasReproSection
      ? [
          '',
          '** 再現手順・挙動',
          reproSteps ? (toBacklogList(plainBlock(reproSteps)) || '- （未入力）') : '- （未入力）',
          ...bulletLine('再現環境（ブラウザ・OS・本番/STG環境）', reproEnv),
          ...bulletLine('現在の挙動', currentBehavior),
          ...bulletLine('期待する挙動', expectedBehavior),
        ]
      : []),
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

const BACKLOG_TITLE_MAX_LENGTH = 80;
const TITLE_POINT_MAX_LENGTH = 50;

// ========== 共通ユーティリティ ==========

/** 改行で分割し、先頭の非空行を返す */
function getFirstLine(text: string): string {
  const line = String(text ?? '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  return line ?? '';
}

/** 先頭1文を返す（句点で区切る。無ければ先頭1行） */
function getFirstSentence(text: string): string {
  const s = String(text ?? '').trim();
  if (!s) return '';
  const byPeriod = s.split(/。[ \t]*/);
  const first = byPeriod[0]?.trim() ?? '';
  if (first) return first + (s.includes('。') ? '。' : '');
  return getFirstLine(s);
}

/**
 * タイトル用の文章正規化（要約形式）。
 * 長文は「先頭1行のみ・最大50文字」で打ち切り。一覧で意味が分かる長さに収める。
 */
function normalizeTitlePhrase(text: string): string {
  let s = getFirstLine(text).trim();
  if (!s) return '';
  s = s.replace(/。+$/, '');
  s = s.replace(/(.+?)ようにして[ほへ]しい.*$/i, '$1こと');
  s = s.replace(/(.+?)して[ほへ]しい.*$/i, '$1されること');
  s = s.replace(/お願いします。?/g, '').replace(/してください。?/g, '').replace(/してほしい。?/gi, '').replace(/したい。?/g, '');
  s = s.replace(/。+$/, '').trim();
  return limitTitleLength(s, TITLE_POINT_MAX_LENGTH);
}

/** タイトル用に整形：先頭1文/1行、句点削除、長さ制限（既存の汎用） */
function normalizeTitleText(text: string, maxLen: number = TITLE_POINT_MAX_LENGTH): string {
  const raw = getFirstSentence(text) || getFirstLine(text);
  const trimmed = raw.replace(/。+$/, '').trim();
  return limitTitleLength(trimmed, maxLen);
}

/** 最大文字数で切り詰め（省略記号は…） */
function limitTitleLength(text: string, maxLen: number = TITLE_POINT_MAX_LENGTH): string {
  const t = String(text ?? '').trim();
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen - 1) + '…';
}

/** 依頼種別＋要点＋対象を組み立て、全体が BACKLOG_TITLE_MAX_LENGTH を超える場合は要点を短くする */
function buildTitleWithMaxLength(prefix: string, point: string, targetPart: string): string {
  const full = `${prefix} ${point}${targetPart}`.trim();
  if (full.length <= BACKLOG_TITLE_MAX_LENGTH) return full;
  const pointBudget = BACKLOG_TITLE_MAX_LENGTH - prefix.length - 1 - targetPart.length;
  if (pointBudget < 10) return full.slice(0, BACKLOG_TITLE_MAX_LENGTH - 1) + '…';
  const shortened = limitTitleLength(point, pointBudget);
  return `${prefix} ${shortened}${targetPart}`.trim();
}

/** URL からスラッグ（パス末尾セグメント）を取得 */
function shortenUrlPath(urlStr: string): string {
  try {
    const normalized = urlStr.trim().startsWith('http') ? urlStr : `https://${urlStr}`;
    const url = new URL(normalized);
    const path = url.pathname.replace(/\/+$/, '');
    const segs = path.split('/').filter(Boolean);
    return segs[segs.length - 1] ?? url.hostname;
  } catch {
    return '';
  }
}

/**
 * 対象の表示用：URLならスラッグ（最後のpath要素）、そうでなければページ名としてそのまま。
 * 「能楽検索ページ」のようにURLでない入力に https:// を付けて解釈すると punycode になるため、
 * 明らかにURLのときだけスラッグを取得する。
 */
function resolveTarget(urlOrPageName: string): string {
  const raw = String(urlOrPageName ?? '').trim();
  if (!raw || raw === '（未入力）') return '';
  const looksLikeUrl =
    /^https?:\/\//i.test(raw) || raw.startsWith('/') || (raw.includes('.') && raw.includes('/'));
  if (looksLikeUrl) {
    const slug = shortenUrlPath(raw);
    if (slug) return slug;
  }
  return raw;
}

/** 確認系完了条件の除外語（これらの語を含む場合はタイトルに使わない） */
const DONE_DEFINITION_EXCLUDE_PHRASES = [
  'クライアント確認',
  '確認を以て完了',
  '問題ないこと',
  '対応完了',
  '承認',
  '確認後',
];

function shouldExcludeDoneDefinition(text: string): boolean {
  const t = String(text ?? '').trim();
  return DONE_DEFINITION_EXCLUDE_PHRASES.some((p) => t.includes(p));
}

/** 要点を少し短縮したバリエーション（候補2用） */
function shortenPointForCandidate(point: string, maxLen: number = 35): string {
  const t = point.replace(/。+$/, '').trim();
  if (t.length <= maxLen) return t;
  const shortened = t.slice(0, maxLen - 1) + '…';
  const lastComma = shortened.lastIndexOf('、');
  if (lastComma > 15) return shortened.slice(0, lastComma + 1);
  return shortened;
}

// ========== 本文パース：Backlog記法から項目を抽出 ==========

/** 本文から「- ラベル：値」の行を抽出（値が同行にある場合） */
function parseBulletValue(line: string, label: string): string | null {
  const m = line.match(new RegExp(`^[-*]\\s*${label}[：:]\\s*(.+)$`));
  if (!m) return null;
  const v = m[1].trim();
  return v && v !== '（未入力）' && v !== '（未選択）' ? v : null;
}

/** 再現手順・挙動セクション内で、タイトル要点に使うべきでないラベル行か（再現環境・現在の挙動・期待する挙動の見出し行は除外） */
function isReproLabelLine(v: string): boolean {
  return /^再現環境[（\s：:]|^現在の挙動[：:]|^期待する挙動[：:]/.test(v);
}

/** 本文を1回走査して必要な項目をすべて抽出する */
function parseBodyForTitle(body: string): {
  type: 'cause' | 'fix' | 'requirement' | 'production' | 'unknown';
  requestPhrase: string;
  changeContent: string;
  targetRaw: string;
  projectName: string;
  doneDefinitionRaw: string;
  reproFirstLine: string;
  reproLines: string[];
  currentBehaviorRaw: string;
} {
  const lines = String(body ?? '').trim().split(/\r?\n/);
  const firstLine = lines[0] ?? '';

  let type: 'cause' | 'fix' | 'requirement' | 'production' | 'unknown' = 'unknown';
  if (/^\*\s+原因確認依頼/.test(firstLine)) type = 'cause';
  else if (/^\*\s+修正依頼/.test(firstLine)) type = 'fix';
  else if (/^\*\s+要件整理/.test(firstLine)) type = 'requirement';
  else if (/^\*\s+制作進行依頼/.test(firstLine)) type = 'production';

  let requestPhrase = '';
  let changeContent = '';
  let targetRaw = '';
  let projectName = '';
  let doneDefinitionRaw = '';
  let reproFirstLine = '';
  const reproLines: string[] = [];
  let currentBehaviorRaw = '';

  let inRequest = false;
  let inDone = false;
  let inRepro = false;
  let doneLabelSeen = false;
  let currentBehaviorLabelSeen = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';

    if (line.startsWith('- ') && !/^-\s*現在の挙動[：:]/.test(line)) {
      currentBehaviorLabelSeen = false;
    }

    const t = parseBulletValue(line, '対象');
    if (t) targetRaw = t;

    const p = parseBulletValue(line, '案件名');
    if (p) projectName = p;

    const change = parseBulletValue(line, '今回の変更・対応内容');
    if (change) changeContent = change;

    if (/^-\s*現在の挙動[：:]/.test(line)) {
      const afterColon = line.replace(/^-\s*現在の挙動[：:]\s*/, '').trim();
      if (afterColon && afterColon !== '（未入力）') {
        currentBehaviorRaw = afterColon;
      } else {
        currentBehaviorLabelSeen = true;
      }
      continue;
    }
    if (currentBehaviorLabelSeen && line.trim() && !line.startsWith('*') && !line.startsWith('- ')) {
      if (!currentBehaviorRaw) currentBehaviorRaw = line.trim();
      else currentBehaviorRaw += '\n' + line.trim();
    } else {
      currentBehaviorLabelSeen = false;
    }
    const currentBhv = parseBulletValue(line, '現在の挙動');
    if (currentBhv) currentBehaviorRaw = currentBhv;

    if (/^\*\*\s+お願いしたいこと/.test(line)) {
      inRequest = true;
      continue;
    }
    if (inRequest && !requestPhrase && line.trim()) {
      const trimmed = line.replace(/^[-*]\s*/, '').trim();
      if (trimmed && trimmed !== '（依頼内容未選択）') {
        requestPhrase = trimmed;
        inRequest = false;
      }
    }

    if (/^\*\*\s+完了条件・確認観点/.test(line)) {
      inDone = true;
      doneLabelSeen = false;
      continue;
    }
    if (line.startsWith('**')) inDone = false;
    if (inDone && /^-\s*完了条件[：:]/.test(line)) {
      const afterColon = line.replace(/^-\s*完了条件[：:]\s*/, '').trim();
      if (afterColon && afterColon !== '（未入力）') {
        doneDefinitionRaw = afterColon;
      } else {
        doneLabelSeen = true;
      }
    } else if (inDone && doneLabelSeen && line.trim() && !line.startsWith('*') && !line.startsWith('-')) {
      if (!doneDefinitionRaw) doneDefinitionRaw = line.trim();
      doneLabelSeen = false;
    }

    if (/^\*\*\s+再現手順・挙動/.test(line)) {
      inRepro = true;
      currentBehaviorLabelSeen = false;
      continue;
    }
    if (line.startsWith('**')) {
      inRepro = false;
      currentBehaviorLabelSeen = false;
    }
    if (inRepro && line.startsWith('- ')) {
      const v = line.replace(/^-\s*/, '').trim();
      if (v && v !== '（未入力）' && !isReproLabelLine(v)) {
        if (!reproFirstLine) reproFirstLine = v;
        reproLines.push(v);
      }
    }
  }

  if (doneDefinitionRaw && doneDefinitionRaw.includes('\n')) {
    doneDefinitionRaw = getFirstLine(doneDefinitionRaw) || doneDefinitionRaw;
  }

  return {
    type,
    requestPhrase,
    changeContent,
    targetRaw,
    projectName,
    doneDefinitionRaw,
    reproFirstLine,
    reproLines,
    currentBehaviorRaw,
  };
}

// ========== 依頼種別ごとのタイトル候補生成（2〜3件） ==========

type Parsed = ReturnType<typeof parseBodyForTitle>;

/** 原因確認: [原因確認] 要点（対象） 優先 1)現在の状態 2)再現手順 3)今回の変更・対応内容。要約形式の正規化を適用。 */
function generateCauseTitleCandidates(parsed: Parsed): string[] {
  const prefix = '[原因確認]';
  const target = resolveTarget(parsed.targetRaw);
  const targetPart = target ? `（${target}）` : '';

  const pointA = parsed.currentBehaviorRaw
    ? normalizeTitlePhrase(parsed.currentBehaviorRaw)
    : parsed.reproFirstLine
      ? normalizeTitlePhrase(parsed.reproFirstLine)
      : parsed.changeContent
        ? normalizeTitlePhrase(parsed.changeContent)
        : '';

  const candidates: string[] = [];
  if (pointA) {
    candidates.push(buildTitleWithMaxLength(prefix, pointA, targetPart || ''));
    const pointB = shortenPointForCandidate(pointA);
    if (pointB !== pointA) {
      candidates.push(buildTitleWithMaxLength(prefix, pointB, targetPart || ''));
    }
  }
  if (parsed.reproLines.length >= 2) {
    const pointC = normalizeTitlePhrase(parsed.reproLines[1]);
    if (pointC && !candidates.some((c) => c.includes(pointC))) {
      candidates.push(buildTitleWithMaxLength(prefix, pointC, targetPart || ''));
    }
  }
  if (target && candidates.length === 0) candidates.push(`${prefix} （${target}）`);
  if (candidates.length === 0) candidates.push(`${prefix} 依頼`);
  return candidates.slice(0, 3);
}

/** 修正依頼: [修正依頼] 要点（対象） 優先 1)理想の状態(完了条件) 2)現在の状態(現在の挙動) 3)今回の変更・対応内容。確認系完了条件は除外。要約形式の正規化を適用。 */
function generateFixTitleCandidates(parsed: Parsed): string[] {
  const prefix = '[修正依頼]';
  const target = resolveTarget(parsed.targetRaw);
  const targetPart = target ? `（${target}）` : '';

  const useDone =
    parsed.doneDefinitionRaw && !shouldExcludeDoneDefinition(parsed.doneDefinitionRaw);
  const pointA = useDone
    ? normalizeTitlePhrase(parsed.doneDefinitionRaw)
    : parsed.currentBehaviorRaw
      ? normalizeTitlePhrase(parsed.currentBehaviorRaw)
      : parsed.changeContent
        ? normalizeTitlePhrase(parsed.changeContent)
        : parsed.requestPhrase
          ? normalizeTitlePhrase(parsed.requestPhrase)
          : '';

  const candidates: string[] = [];
  if (pointA) {
    candidates.push(buildTitleWithMaxLength(prefix, pointA, targetPart || ''));
    const pointB = shortenPointForCandidate(pointA);
    if (pointB !== pointA) {
      candidates.push(buildTitleWithMaxLength(prefix, pointB, targetPart || ''));
    }
  }
  if (useDone && parsed.currentBehaviorRaw) {
    const alt = normalizeTitlePhrase(parsed.currentBehaviorRaw);
    if (alt && !candidates.some((c) => c.includes(alt))) {
      candidates.push(buildTitleWithMaxLength(prefix, alt, targetPart || ''));
    }
  }
  if (useDone && parsed.changeContent) {
    const alt = normalizeTitlePhrase(parsed.changeContent);
    if (alt && !candidates.some((c) => c.includes(alt))) {
      candidates.push(buildTitleWithMaxLength(prefix, alt, targetPart || ''));
    }
  }
  if (!useDone && parsed.doneDefinitionRaw && !shouldExcludeDoneDefinition(parsed.doneDefinitionRaw)) {
    const alt = normalizeTitlePhrase(parsed.doneDefinitionRaw);
    if (alt && !candidates.some((c) => c.includes(alt))) {
      candidates.push(buildTitleWithMaxLength(prefix, alt, targetPart || ''));
    }
  }
  if (target && candidates.length === 0) candidates.push(`${prefix} （${target}）`);
  if (candidates.length === 0) candidates.push(`${prefix} 依頼`);
  return [...new Set(candidates)].slice(0, 3);
}

/** 要件整理: 候補A=「〇〇の整理」, B=「〇〇の要件定義」など */
function generateRequirementTitleCandidates(parsed: Parsed): string[] {
  const prefix = '[要件整理]';
  const project = parsed.projectName ? limitTitleLength(parsed.projectName.trim(), 30) : '';
  const base = project ? `${prefix} ${project} - ` : prefix + ' ';

  let pointA = '';
  let pointB = '';
  if (parsed.requestPhrase) {
    const beforeTame = parsed.requestPhrase.match(/^(.+?)のため、/);
    if (beforeTame && beforeTame[1]) {
      pointA = limitTitleLength(beforeTame[1].trim() + 'の整理');
      pointB = limitTitleLength(beforeTame[1].trim() + 'の要件定義');
    } else {
      const s = parsed.requestPhrase
        .replace(/[のため、]*要件整理[・\s]*相談をお願いします。?$/i, '')
        .replace(/をお願いします。?$/i, '')
        .trim();
      pointA = normalizeTitleText(s || parsed.requestPhrase);
      pointB = pointA.replace(/の整理$/, 'の要件定義') || pointA;
    }
  }
  if (!pointA && parsed.changeContent) pointA = pointB = normalizeTitleText(parsed.changeContent);

  const candidates: string[] = [];
  if (pointA) candidates.push((base + pointA).trim());
  if (pointB && pointB !== pointA) candidates.push((base + pointB).trim());
  if (project && candidates.length === 0) candidates.push(`${prefix} ${project}`);
  if (candidates.length === 0) candidates.push(`${prefix} 依頼`);
  return candidates.slice(0, 3);
}

/** 制作進行: 候補A=「〇〇改修」, B=「〇〇実装対応」など */
function generateProgressTitleCandidates(parsed: Parsed): string[] {
  const prefix = '[制作進行]';
  const project = parsed.projectName ? limitTitleLength(parsed.projectName.trim(), 30) : '';
  const base = project ? `${prefix} ${project} - ` : prefix + ' ';

  let pointA = '';
  let pointB = '';
  if (parsed.requestPhrase) {
    const s = parsed.requestPhrase
      .replace(/のため、実装をお願いします。?$/i, '')
      .replace(/の進行対応をお願いします。?$/i, '')
      .replace(/をお願いします。?$/i, '')
      .trim();
    pointA = normalizeTitleText(s || parsed.requestPhrase);
    if (pointA && !pointA.endsWith('改修') && !pointA.endsWith('実装対応')) {
      pointB = pointA + '実装対応';
    } else {
      pointB = pointA.replace(/改修$/, '実装対応') || pointA;
    }
  }
  if (!pointA && parsed.changeContent) pointA = pointB = normalizeTitleText(parsed.changeContent);

  const candidates: string[] = [];
  if (pointA) candidates.push((base + pointA).trim());
  if (pointB && pointB !== pointA) candidates.push((base + pointB).trim());
  if (project && candidates.length === 0) candidates.push(`${prefix} ${project}`);
  if (candidates.length === 0) candidates.push(`${prefix} 依頼`);
  return candidates.slice(0, 3);
}

/**
 * 生成済み本文（Backlog記法）から、Backlog課題のタイトル候補を2〜3件生成する。
 * 「今回の変更・対応内容」と「今欲しい対応」は連結しない。
 */
export function generateBacklogTitleFromBody(body: string): string[] {
  const raw = String(body ?? '').trim();
  if (!raw) return [];

  const parsed = parseBodyForTitle(raw);

  switch (parsed.type) {
    case 'cause':
      return generateCauseTitleCandidates(parsed);
    case 'fix':
      return generateFixTitleCandidates(parsed);
    case 'requirement':
      return generateRequirementTitleCandidates(parsed);
    case 'production':
      return generateProgressTitleCandidates(parsed);
    default: {
      const label = (raw.match(/^\*\s+(.+)/)?.[1]?.trim() ?? '').replace(/依頼$/, '');
      const prefix = label ? `[${label}]` : '';
      const point = parsed.requestPhrase
        ? normalizeTitleText(parsed.requestPhrase)
        : parsed.changeContent
          ? normalizeTitleText(parsed.changeContent)
          : '依頼';
      return [prefix ? `${prefix} ${point}` : point];
    }
  }
}
