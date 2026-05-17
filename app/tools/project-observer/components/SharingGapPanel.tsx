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
        <p className="text-base text-slate-500">
          共有不足のシグナルは検出されていません。
        </p>
      ) : (
        <ul className="space-y-2">
          {signals.map((s) => (
            <li
              key={s.id}
              className="rounded-md border border-amber-900/25 bg-amber-950/15 px-4 py-3 text-base text-amber-100/90"
            >
              {s.label}
              {s.daysSilent != null && (
                <span className="ml-2 font-mono text-sm text-slate-500">
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
