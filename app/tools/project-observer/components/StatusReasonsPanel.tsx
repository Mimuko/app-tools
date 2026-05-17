import { SHARE_STATUS_CONFIG } from './constants';
import { Panel } from './Panel';
import type { StatusReason } from '../types';

interface StatusReasonsPanelProps {
  reasons: StatusReason[];
  activeStatus: StatusReason['contributesTo'];
}

export function StatusReasonsPanel({ reasons, activeStatus }: StatusReasonsPanelProps) {
  const active = reasons.filter((r) => r.contributesTo === activeStatus);
  const other = reasons.filter((r) => r.contributesTo !== activeStatus && r.contributesTo !== 'stable');

  return (
    <Panel title="判定の根拠" hint="要注目 > 注意 > 安定 — 最も優先度の高い状態を採用">
      <p className="mb-3 text-sm obs-text-muted">
        更新があっても仕様未FIXなどがあれば「安定」にはしません。
      </p>
      <ul className="space-y-2">
        {active.map((r) => (
          <ReasonRow key={r.code} reason={r} emphasized />
        ))}
        {other.map((r) => (
          <ReasonRow key={r.code} reason={r} />
        ))}
      </ul>
    </Panel>
  );
}

function ReasonRow({ reason, emphasized }: { reason: StatusReason; emphasized?: boolean }) {
  const cfg = SHARE_STATUS_CONFIG[reason.contributesTo];
  return (
    <li
      className={`flex gap-2 rounded-md border px-3 py-2 text-base ${
        emphasized
          ? 'border-cyan-500/35 bg-cyan-50 obs-text-primary dark:border-cyan-800/40 dark:bg-cyan-950/20'
          : 'obs-surface-inset obs-text-muted'
      }`}
    >
      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dotClass}`} />
      <span>{reason.label}</span>
    </li>
  );
}
