import { DIRECTOR_TEAM, OBSERVATION_CONFIG } from '../lib/observation/config';
import { SHARE_STATUS_CONFIG } from './constants';
import type { ShareStatus } from '../types';

const ORDER: ShareStatus[] = ['attention', 'caution', 'stable'];

export function StatusLegend() {
  return (
    <section className="obs-surface-muted mb-8 rounded-lg p-5">
      <h2 className="obs-heading">観測仕様（PoC）</h2>
      <p className="mt-2 text-sm leading-relaxed obs-text-muted">
        優先: <strong className="obs-text-secondary">要注目 &gt; 注意 &gt; 安定</strong>
        。更新があっても未FIXなら要注目。閾値は
        <strong className="obs-text-secondary">
          {' '}
          {OBSERVATION_CONFIG.staleBusinessDays}営業日
        </strong>
        （課題更新日ベース）。コメント解析は最新
        {OBSERVATION_CONFIG.commentParseLimit}件+本文。
      </p>
      <ul className="mt-4 space-y-3">
        {ORDER.map((key) => {
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
      <p className="obs-divider mt-4 border-t pt-3 text-sm obs-text-faint">
        負荷集計: {DIRECTOR_TEAM.map((d) => d.backlogName).join(' · ')}
      </p>
    </section>
  );
}
