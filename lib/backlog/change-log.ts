import type { BacklogComment } from './client';

/** Backlog コメント changeLog の担当者変更フィールド名 */
const ASSIGNEE_CHANGE_FIELDS = ['assigner', 'assignee'] as const;

/**
 * コメント一覧（order=desc）から、指定フィールドの直近変更日時を返す。
 * 変更のみのコメントでは comment.created が変更日時になる。
 */
export function findLatestFieldChangeAt(
  comments: BacklogComment[],
  field: 'status' | 'assignee',
): string | null {
  const fields =
    field === 'status' ? (['status'] as const) : ASSIGNEE_CHANGE_FIELDS;
  const fieldSet = new Set<string>(fields);

  for (const comment of comments) {
    if (!comment.changeLog?.length) continue;
    if (comment.changeLog.some((entry) => fieldSet.has(entry.field))) {
      return comment.created;
    }
  }
  return null;
}

export function maxIsoDate(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
}
