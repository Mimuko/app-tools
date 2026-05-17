import { formatRelativeTime } from '../lib/format';
import type { ProjectSummary } from '../types';
import { SHARE_STATUS_CONFIG } from './constants';
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
      <p className={`font-mono text-xl tabular-nums ${valueClass}`}>{value}</p>
      <p className="mt-1 text-sm uppercase tracking-wider text-slate-500">{label}</p>
    </div>
  );
}

export function ProjectCard({ project }: ProjectCardProps) {
  const status = SHARE_STATUS_CONFIG[project.shareStatus];
  const topReason = project.statusReasons.find(
    (r) => r.contributesTo === project.shareStatus,
  );

  return (
    <article
      className={`relative overflow-hidden rounded-lg border bg-gradient-to-br to-[#0a1018] p-6 ${status.borderClass} ${status.glowClass}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-500">{project.clientName}</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-100">{project.name}</h3>
        </div>
        <ShareStatusBadge status={project.shareStatus} size="sm" />
      </div>

      {topReason && (
        <p className="mt-3 text-sm leading-relaxed text-slate-500 line-clamp-2">
          {topReason.label}
        </p>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-cyan-900/20 pt-4">
        <MetricCell label="要件未確定" value={project.requirementsUnsetCount} tone="warn" />
        <MetricCell label="確認待ち" value={project.awaitingConfirmationCount} />
        <MetricCell label="未返信" value={project.unrepliedIssueCount} tone="warn" />
      </div>

      <p className="mt-3 font-mono text-sm text-slate-600">
        課題更新 {formatRelativeTime(project.lastIssueUpdatedAt)}
      </p>
    </article>
  );
}
