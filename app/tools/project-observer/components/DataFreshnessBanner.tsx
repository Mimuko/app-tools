import { OBSERVATION_CONFIG } from '../lib/observation/config';
import { formatDateTime } from '../lib/format';

interface DataFreshnessBannerProps {
  dataObservedAt: string;
}

export function DataFreshnessBanner({ dataObservedAt }: DataFreshnessBannerProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3 rounded-lg border border-cyan-900/30 bg-[#0a1018]/90 px-4 py-3">
      <div>
        <p className="font-mono text-sm uppercase tracking-widest text-cyan-600/80">
          データ鮮度
        </p>
        <p className="mt-1 text-base text-slate-300">
          観測時刻:{' '}
          <span className="font-mono text-cyan-400/90">
            {formatDateTime(dataObservedAt)}
          </span>
        </p>
      </div>
      <div className="text-right text-sm leading-relaxed text-slate-500">
        <p>
          更新: {OBSERVATION_CONFIG.batchScheduleLabel} バッチ（
          {OBSERVATION_CONFIG.batchTimezone}）
        </p>
        <p className="mt-0.5">対象: {OBSERVATION_CONFIG.backlogSpaceLabel}</p>
        <p className="mt-0.5">
          「更新」= Backlog課題更新日 · 閾値 {OBSERVATION_CONFIG.staleBusinessDays}営業日
        </p>
      </div>
    </div>
  );
}
