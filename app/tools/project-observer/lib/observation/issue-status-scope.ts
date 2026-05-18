/** Backlog 課題ステータス — 観測・同期の対象（表示名の完全一致）。処理済・完了は対象外。 */
export const ISSUE_STATUS_ALLOWLIST = ['処理中', '未対応'] as const;

const ALLOWED = new Set<string>(ISSUE_STATUS_ALLOWLIST);

export function isAllowedObservationIssueStatus(statusName: string): boolean {
  return ALLOWED.has(statusName.trim());
}
