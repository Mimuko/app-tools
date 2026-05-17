import 'server-only';

import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { getBacklogProjectKeys } from '@/lib/backlog/env';

const SNAPSHOT_PATH = path.join(
  process.cwd(),
  'app/tools/project-observer/data/snapshot.json',
);

/** 静的エクスポート用 — スナップショットに含まれる projectKey 一覧 */
export function getSnapshotProjectIds(): string[] {
  if (!existsSync(SNAPSHOT_PATH)) return [];
  try {
    const raw = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8')) as {
      records?: Array<{ signals: { projectId: string } }>;
    };
    return (raw.records ?? []).map((r) => r.signals.projectId).filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * generateStaticParams 用。
 * ビルド時はスナップショット → BACKLOG_PROJECT_IDS → ランタイム取得の順で ID を解決する。
 */
export async function getProjectIdsForStaticParams(): Promise<string[]> {
  const fromSnapshot = getSnapshotProjectIds();
  if (fromSnapshot.length > 0) return fromSnapshot;

  const fromEnv = getBacklogProjectKeys();
  if (fromEnv.length > 0) return fromEnv;

  const { getAllProjectIds } = await import('../mock/projects');
  return getAllProjectIds();
}
