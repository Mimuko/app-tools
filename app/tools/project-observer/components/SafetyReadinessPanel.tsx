import {
  NEXT_ACTION_CONFIG,
  PROCEED_SAFETY_CONFIG,
  SHARE_STATUS_CONFIG,
} from './constants';
import type { NextActionClarity, ProceedSafety, ShareStatus } from '../types';

interface SafetyReadinessPanelProps {
  shareStatus: ShareStatus;
  proceedSafety: ProceedSafety;
  nextActionClarity: NextActionClarity;
  sharingObservation: string;
}

export function SafetyReadinessPanel({
  shareStatus,
  proceedSafety,
  nextActionClarity,
  sharingObservation,
}: SafetyReadinessPanelProps) {
  const safety = PROCEED_SAFETY_CONFIG[proceedSafety];
  const nextAction = NEXT_ACTION_CONFIG[nextActionClarity];
  const status = SHARE_STATUS_CONFIG[shareStatus];

  return (
    <section className="mb-8 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
      <div className={`rounded-lg border px-5 py-4 ${safety.className}`}>
        <p className="text-sm uppercase tracking-widest opacity-70">
          いま進めて安全か
        </p>
        <p className="mt-2 text-xl font-semibold">{safety.label}</p>
        <p className="mt-1 text-base opacity-80">{safety.description}</p>
      </div>

      <div className="obs-surface rounded-lg px-5 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`h-2 w-2 rounded-full ${status.dotClass}`} />
          <span className="text-base obs-text-secondary">{status.label}</span>
          <span className="obs-text-faint">|</span>
          <span className="text-sm obs-text-muted">次アクション</span>
          <span className={`text-base font-medium ${nextAction.className}`}>
            {nextAction.label}
          </span>
        </div>
        <p className="mt-3 text-base leading-relaxed obs-text-muted">{sharingObservation}</p>
      </div>
    </section>
  );
}
