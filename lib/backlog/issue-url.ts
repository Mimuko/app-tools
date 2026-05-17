import 'server-only';

import { getBacklogSpaceOrigin } from './env';

/** 課題詳細ページ URL（例: https://crh.backlog.jp/view/PROJECT-123） */
export function getBacklogIssueUrl(issueKey: string): string | null {
  const origin = getBacklogSpaceOrigin();
  const key = issueKey?.trim();
  if (!origin || !key) return null;
  return `${origin}/view/${encodeURIComponent(key)}`;
}
