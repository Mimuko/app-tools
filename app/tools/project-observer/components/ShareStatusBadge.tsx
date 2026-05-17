import { SHARE_STATUS_CONFIG } from './constants';
import type { ShareStatus } from '../types';

interface ShareStatusBadgeProps {
  status: ShareStatus;
  size?: 'sm' | 'md';
  showMeaning?: boolean;
}

export function ShareStatusBadge({
  status,
  size = 'md',
  showMeaning = false,
}: ShareStatusBadgeProps) {
  const config = SHARE_STATUS_CONFIG[status];
  const isSmall = size === 'sm';

  return (
    <div
      className={`inline-flex flex-col gap-1 rounded-full border px-3 py-1 ${config.borderClass} bg-[#0c1219]/80`}
      title={config.meaning}
    >
      <span className="inline-flex items-center gap-2">
        <span
          className={`rounded-full ${isSmall ? 'h-2 w-2' : 'h-2.5 w-2.5'} ${config.dotClass}`}
        />
        <span
          className={`font-mono uppercase tracking-wider text-slate-300 ${isSmall ? 'text-[10px]' : 'text-xs'}`}
        >
          {config.label}
        </span>
      </span>
      {showMeaning && !isSmall && (
        <span className="max-w-xs text-[10px] leading-snug text-slate-500">{config.meaning}</span>
      )}
    </div>
  );
}
