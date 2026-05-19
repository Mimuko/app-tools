/**
 * Backlog コメント記法 — 朝会支援UI の正式観測ソース
 * 自然文推定は行わず、明示ラベル（要確認： 等）のみを読む。
 */

export interface CommentNotation {
  /** `要確認：` の本文 */
  needsReview: string | null;
  /** `社内待ち：` の本文 */
  waitingInternal: string | null;
  /** `外部待ち：` の本文 */
  waitingExternal: string | null;
  /** `次アクション：` の本文 */
  nextAction: string | null;
}

export type CommentNotationField = keyof CommentNotation;

const FIELD_ORDER: CommentNotationField[] = [
  'needsReview',
  'waitingInternal',
  'waitingExternal',
  'nextAction',
];

const LABEL_BY_FIELD: Record<CommentNotationField, string> = {
  needsReview: '要確認',
  waitingInternal: '社内待ち',
  waitingExternal: '外部待ち',
  nextAction: '次アクション',
};

const FIELD_BY_LABEL = new Map<string, CommentNotationField>(
  Object.entries(LABEL_BY_FIELD).map(([field, label]) => [label, field as CommentNotationField]),
);

/** 行頭の記法ラベル（全角・半角コロン） */
const LABEL_LINE =
  /^(要確認|社内待ち|外部待ち|次アクション)\s*[：:]\s*(.*)$/;

function emptyNotation(): CommentNotation {
  return {
    needsReview: null,
    waitingInternal: null,
    waitingExternal: null,
    nextAction: null,
  };
}

function normalizeBody(lines: string[]): string | null {
  const body = lines
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .join('\n')
    .trim();
  return body.length > 0 ? body.slice(0, 500) : null;
}

/** 1 コメント本文から記法ブロックを抽出 */
export function parseCommentNotation(text: string): CommentNotation {
  const result = emptyNotation();
  if (!text?.trim()) return result;

  let current: CommentNotationField | null = null;
  const buffer: string[] = [];

  const flush = () => {
    if (!current) return;
    const value = normalizeBody(buffer);
    if (value && !result[current]) {
      result[current] = value;
    }
    buffer.length = 0;
  };

  for (const rawLine of text.replace(/\r\n/g, '\n').split('\n')) {
    const line = rawLine.trimEnd();
    const match = line.trim().match(LABEL_LINE);
    if (match) {
      flush();
      const field = FIELD_BY_LABEL.get(match[1]);
      if (!field) continue;
      current = field;
      const rest = match[2].trim();
      if (rest) buffer.push(rest);
    } else if (current) {
      buffer.push(line);
    }
  }
  flush();

  return result;
}

/**
 * 新しいコメントほど優先（comments[0] = 最新想定）
 * 各フィールドは最初に見つかった非空値を採用
 */
export function parseCommentsNotation(commentTextsNewestFirst: string[]): CommentNotation {
  const merged = emptyNotation();
  const limit = commentTextsNewestFirst.length;

  for (let i = 0; i < limit; i++) {
    const parsed = parseCommentNotation(commentTextsNewestFirst[i] ?? '');
    for (const field of FIELD_ORDER) {
      if (!merged[field] && parsed[field]) {
        merged[field] = parsed[field];
      }
    }
  }

  return merged;
}

export function hasAnyCommentNotation(n: CommentNotation): boolean {
  return FIELD_ORDER.some((f) => Boolean(n[f]));
}

export interface IssueActionFlags {
  needsConfirmation: boolean;
  externalWait: boolean;
  internalWait: boolean;
  hasNextAction: boolean;
  needsReviewNote: string | null;
  waitingExternalNote: string | null;
  waitingInternalNote: string | null;
  nextActionNote: string | null;
}

export function flagsFromCommentNotation(
  notation: CommentNotation,
  isDirectorAssignee: boolean,
): IssueActionFlags {
  if (!isDirectorAssignee) {
    return {
      needsConfirmation: false,
      externalWait: false,
      internalWait: false,
      hasNextAction: false,
      needsReviewNote: null,
      waitingExternalNote: null,
      waitingInternalNote: null,
      nextActionNote: null,
    };
  }

  return {
    needsConfirmation: Boolean(notation.needsReview),
    externalWait: Boolean(notation.waitingExternal),
    internalWait: Boolean(notation.waitingInternal),
    hasNextAction: Boolean(notation.nextAction),
    needsReviewNote: notation.needsReview,
    waitingExternalNote: notation.waitingExternal,
    waitingInternalNote: notation.waitingInternal,
    nextActionNote: notation.nextAction,
  };
}

export { LABEL_BY_FIELD };
