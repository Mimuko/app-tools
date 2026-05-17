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
      ? 'obs-metric-value--warn'
      : tone === 'muted' || value === 0
        ? 'obs-metric-value--muted'
        : 'obs-metric-value';

  return (
    <div className="text-center">
      <p className={`font-mono text-xl tabular-nums ${valueClass}`}>{value}</p>
      <p className="mt-1 text-sm uppercase tracking-wider obs-text-muted">{label}</p>
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
      className={`relative overflow-hidden rounded-lg border bg-gradient-to-br to-[var(--obs-card-to)] p-6 ${status.borderClass} ${status.glowClass}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm obs-text-muted">{project.clientName}</p>
          <h3 className="obs-title mt-1 text-lg">{project.name}</h3>
        </div>
        <ShareStatusBadge status={project.shareStatus} size="sm" />
      </div>

      {topReason && (
        <p className="mt-3 text-sm leading-relaxed obs-text-muted line-clamp-2">
          {topReason.label}
        </p>
      )}

      <div className="obs-divider mt-4 grid grid-cols-3 gap-2 border-t pt-4">
        <MetricCell label="要件未確定" value={project.requirementsUnsetCount} tone="warn" />
        <MetricCell label="確認待ち" value={project.awaitingConfirmationCount} />
        <MetricCell label="未返信" value={project.unrepliedIssueCount} tone="warn" />
      </div>

      <p className="mt-3 font-mono text-sm obs-text-faint">
        課題更新 {formatRelativeTime(project.lastIssueUpdatedAt)}
      </p>
    </article>
  );
}
