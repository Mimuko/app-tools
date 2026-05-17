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
        <p className="font-mono text-[10px] uppercase tracking-widest opacity-70">
          いま進めて安全か
        </p>
        <p className="mt-2 text-lg font-semibold">{safety.label}</p>
        <p className="mt-1 text-sm opacity-80">{safety.description}</p>
      </div>

      <div className="rounded-lg border border-cyan-900/25 bg-[#0a1018]/90 px-5 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`h-2 w-2 rounded-full ${status.dotClass}`} />
          <span className="text-sm text-slate-300">{status.label}</span>
          <span className="text-slate-700">|</span>
          <span className="text-xs text-slate-500">次アクション</span>
          <span className={`text-sm font-medium ${nextAction.className}`}>
            {nextAction.label}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{sharingObservation}</p>
      </div>
    </section>
  );
}
