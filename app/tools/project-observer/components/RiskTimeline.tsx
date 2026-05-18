import { formatDateTime } from '../lib/format';
import { RISK_KIND_CONFIG } from './constants';
import { Panel } from './Panel';
import type { RiskTimelineEvent } from '../types';

interface RiskTimelineProps {
  events: RiskTimelineEvent[];
}

export function RiskTimeline({ events }: RiskTimelineProps) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );

  return (
    <Panel title="リスクタイムライン" hint="時系列の変化・揺れ">
      {sorted.length === 0 ? (
        <p className="text-base obs-text-muted">記録されたイベントはありません。</p>
      ) : (
        <ol className="obs-divider relative space-y-0 border-l pl-6">
          {sorted.map((event, index) => {
            const kind = RISK_KIND_CONFIG[event.kind];
            return (
              <li key={event.id} className={`relative pb-8 ${index === sorted.length - 1 ? 'pb-0' : ''}`}>
                <span
                  className={`absolute -left-[1.55rem] top-1 h-3 w-3 rounded-full ring-4 ring-[var(--obs-bg)] ${kind.markerClass}`}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="obs-heading-muted">{kind.label}</span>
                  <span className="text-sm obs-text-faint">
                    {formatDateTime(event.occurredAt)}
                  </span>
                </div>
                <p className="mt-1 text-base font-medium obs-text-primary">{event.title}</p>
                <p className="mt-1 text-sm leading-relaxed obs-text-muted">{event.description}</p>
              </li>
            );
          })}
        </ol>
      )}
    </Panel>
  );
}
