import { Panel } from './Panel';
import type { StopSignal } from '../types';

interface SharingGapPanelProps {
  signals: StopSignal[];
}

export function SharingGapPanel({ signals }: SharingGapPanelProps) {
  return (
    <Panel
      title="共有不足シグナル"
      hint="3営業日以上の共有途切れ — 停滞の独立表示はしません"
    >
      {signals.length === 0 ? (
        <p className="text-base obs-text-muted">
          共有不足のシグナルは検出されていません。
        </p>
      ) : (
        <ul className="space-y-2">
          {signals.map((s) => (
            <li
              key={s.id}
              className="rounded-md border border-amber-500/30 bg-amber-50 px-4 py-3 text-base text-amber-900 dark:border-amber-900/25 dark:bg-amber-950/15 dark:text-amber-100/90"
            >
              {s.label}
              {s.daysSilent != null && (
                <span className="ml-2 font-mono text-sm obs-text-muted">
                  {s.daysSilent}日
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
