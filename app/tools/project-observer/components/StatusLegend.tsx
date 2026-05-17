import { DIRECTOR_TEAM, OBSERVATION_CONFIG } from '../lib/observation/config';
import { ACTION_LABELS } from '../lib/labels';
import { SHARE_STATUS_CONFIG } from './constants';
import type { ShareStatus } from '../types';

const STATE_ORDER: ShareStatus[] = ['attention', 'caution'];

export function StatusLegend() {
  return (
    <section className="obs-surface-muted mb-8 rounded-lg p-5">
      <h2 className="obs-heading">観測仕様（PoC）</h2>
      <p className="mt-2 text-sm leading-relaxed obs-text-muted">
        <strong className="obs-text-secondary">チーム状態</strong>は要注目・注意のみ表示（安定は非表示）。
        <strong className="obs-text-secondary">今日の確認アクション</strong>は担当者ごとの課題一覧。
        更新があっても未FIXなら要注目。閾値は
        <strong className="obs-text-secondary">
          {' '}
          {OBSERVATION_CONFIG.staleBusinessDays}営業日
        </strong>
        （課題更新日ベース）。コメント解析は最新
        {OBSERVATION_CONFIG.commentParseLimit}件+本文。
      </p>
      <p className="mt-4 text-sm font-medium obs-text-secondary">チーム状態（案件）</p>
      <ul className="mt-2 space-y-3">
        {STATE_ORDER.map((key) => {
          const cfg = SHARE_STATUS_CONFIG[key];
          return (
            <li key={key} className="flex gap-3">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${cfg.dotClass}`} />
              <div>
                <p className="text-base font-medium obs-text-primary">{cfg.label}</p>
                <p className="mt-0.5 text-sm leading-relaxed obs-text-muted">{cfg.meaning}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="obs-divider mt-4 border-t pt-4 text-sm font-medium obs-text-secondary">
        今日の確認アクション（担当者）
      </p>
      <ul className="mt-2 space-y-2 text-sm obs-text-muted">
        <li>
          <strong className="obs-text-secondary">{ACTION_LABELS.needsConfirmation}</strong>
          — ディレクター側で確認・判断が必要（旧「確認待ち」）
        </li>
        <li>
          <strong className="obs-text-secondary">{ACTION_LABELS.awaitingReply}</strong>
          — クライアント・外部の返信待ち（社内最終コメント、旧「未返信」）
        </li>
      </ul>
      <p className="obs-divider mt-4 border-t pt-3 text-sm obs-text-faint">
        対象ディレクター: {DIRECTOR_TEAM.map((d) => d.backlogName).join(' · ')}
      </p>
    </section>
  );
}
