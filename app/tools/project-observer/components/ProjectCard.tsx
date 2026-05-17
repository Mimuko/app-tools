import Link from 'next/link';
import { formatRelativeTime } from '../lib/format';
import type { ProjectSummary } from '../types';
import { NEXT_ACTION_CONFIG, PROCEED_SAFETY_CONFIG, SHARE_STATUS_CONFIG } from './constants';
import { ShareStatusBadge } from './ShareStatusBadge';

interface ProjectCardProps {
  project: ProjectSummary;
}

function MetricCell({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: number;
  tone?: 'default' | 'warn' | 'muted';
}) {
  const valueClass =
    tone === 'warn' && value > 0
      ? 'text-rose-300'
      : tone === 'muted' || value === 0
        ? 'text-slate-600'
        : 'text-cyan-300';

  return (
    <div className="text-center">
      <p className={`font-mono text-lg tabular-nums ${valueClass}`}>{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
    </div>
  );
}

export function ProjectCard({ project }: ProjectCardProps) {
  const status = SHARE_STATUS_CONFIG[project.shareStatus];
  const safety = PROCEED_SAFETY_CONFIG[project.proceedSafety];
  const nextAction = NEXT_ACTION_CONFIG[project.nextActionClarity];
  const topReason = project.statusReasons.find(
    (r) => r.contributesTo === project.shareStatus,
  );

  return (
    <Link
      href={`/tools/project-observer/projects/${project.id}`}
      className={`group relative block overflow-hidden rounded-lg border bg-gradient-to-br to-[#0a1018] p-5 transition-all hover:border-cyan-500/40 ${status.borderClass} ${status.glowClass}`}
    >
      <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="font-mono text-[10px] text-cyan-500/70">詳細 →</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500">{project.clientName}</p>
          <h3 className="mt-1 text-base font-semibold text-slate-100 group-hover:text-cyan-50">
            {project.name}
          </h3>
        </div>
        <ShareStatusBadge status={project.shareStatus} size="sm" />
      </div>

      {topReason && (
        <p className="mt-3 text-xs leading-relaxed text-slate-500 line-clamp-2">
          {topReason.label}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
        <span className={`rounded border px-2 py-0.5 ${safety.className}`}>
          {safety.label}
        </span>
        <span className="rounded border border-slate-700/50 px-2 py-0.5 text-slate-400">
          次: <span className={nextAction.className}>{nextAction.label}</span>
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-cyan-900/20 pt-4">
        <MetricCell label="要件未確定" value={project.requirementsUnsetCount} tone="warn" />
        <MetricCell label="確認待ち" value={project.awaitingConfirmationCount} />
        <MetricCell label="未返信" value={project.unrepliedIssueCount} tone="warn" />
      </div>

      <p className="mt-3 font-mono text-[10px] text-slate-600">
        課題更新 {formatRelativeTime(project.lastIssueUpdatedAt)}
      </p>
    </Link>
  );
}
