import { SHARED_OBSERVATION_DEFAULTS } from '../_shared/observation-defaults';

/**
 * 汎用テナント — Netlify 汎用サイト用（Backlog 連携は Netlify 環境変数で指定）
 */
export const OBSERVATION_CONFIG = {
  ...SHARED_OBSERVATION_DEFAULTS,
  backlogSpaceLabel: 'Backlogスペース（環境変数で指定）',
} as const;

/**
 * 負荷集計対象メンバー（Backlog のユーザー表示名と一致させる）
 * 導入時は Netlify の TENANT_ID=generic と BACKLOG_* を設定し、observer:sync でスナップショットを生成する
 */
export const DIRECTOR_TEAM: readonly {
  id: string;
  backlogName: string;
}[] = [
  { id: 'lead-1', backlogName: 'リードA' },
  { id: 'lead-2', backlogName: 'リードB' },
  { id: 'lead-3', backlogName: 'リードC' },
] as const;
