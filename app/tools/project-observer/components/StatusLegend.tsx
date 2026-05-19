import { DIRECTOR_TEAM, OBSERVATION_CONFIG } from '../lib/observation/config';
import { ACTION_LABEL_HINTS, ACTION_LABELS, METRIC_LABEL_HINTS, METRIC_LABELS } from '../lib/labels';
import { SHARE_STATUS_CONFIG } from './constants';
import type { ShareStatus } from '../types';

const STATE_ORDER: ShareStatus[] = ['attention', 'caution'];

export function StatusLegend() {
  return (
    <section className="obs-surface-muted mb-8 rounded-lg p-5">
      <h2 className="obs-heading">観測仕様（PoC）</h2>
      <p className="mt-3 obs-body-sm leading-relaxed obs-text-muted">
        <strong className="obs-text-secondary">危険状態</strong>は要注目・注意（課題本文の未FIX等）。
        <strong className="obs-text-secondary">行動・待機</strong>はコメント記法のみ（要確認： / 社内待ち： / 外部待ち： / 次アクション：）。
        自然文推定は行いません。
        閾値は
        <strong className="obs-text-secondary">
          {' '}
          {OBSERVATION_CONFIG.staleBusinessDays}営業日
        </strong>
        （課題更新日ベース）。
      </p>
      <p className="mt-5 obs-subheading">危険状態（案件）</p>
      <ul className="mt-2 space-y-3">
        {STATE_ORDER.map((key) => {
          const cfg = SHARE_STATUS_CONFIG[key];
          return (
            <li key={key} className="flex gap-3">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${cfg.dotClass}`} />
              <div>
                <p className="obs-body font-semibold obs-text-primary">{cfg.label}</p>
                <p className="mt-1 obs-body-sm leading-relaxed obs-text-muted">{cfg.meaning}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="obs-divider obs-subheading mt-5 border-t pt-5">プロジェクト全体計測</p>
      <ul className="mt-3 space-y-2.5 obs-body-sm obs-text-muted">
        <li>
          <strong className="font-semibold obs-text-secondary">
            {METRIC_LABELS.statusUnrecorded}
          </strong>
          {' — '}
          {METRIC_LABEL_HINTS.statusUnrecorded}
        </li>
      </ul>
      <p className="obs-subheading mt-5">待機・要確認・要整理（担当者）</p>
      <ul className="mt-3 space-y-2.5 obs-body-sm obs-text-muted">
        {(Object.keys(ACTION_LABELS) as Array<keyof typeof ACTION_LABELS>).map((key) => (
          <li key={key}>
            <strong className="font-semibold obs-text-secondary">{ACTION_LABELS[key]}</strong>
            {' — '}
            {ACTION_LABEL_HINTS[key]}
          </li>
        ))}
      </ul>
      <p className="obs-divider mt-4 border-t pt-3 obs-caption">
        対象ディレクター: {DIRECTOR_TEAM.map((d) => d.backlogName).join(' · ')}
      </p>
    </section>
  );
}
