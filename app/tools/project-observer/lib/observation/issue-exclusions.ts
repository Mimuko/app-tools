/**
 * 朝会観測の対象外とする課題タイトル（部分一致）
 * Backlog の summary（件名）を対象とする。
 */
export const ISSUE_TITLE_EXCLUDE_SUBSTRINGS = ['工数管理', '工数計上'] as const;

export function isExcludedObservationIssueTitle(title: string): boolean {
  const normalized = title.trim();
  if (!normalized) return false;
  return ISSUE_TITLE_EXCLUDE_SUBSTRINGS.some((s) => normalized.includes(s));
}
