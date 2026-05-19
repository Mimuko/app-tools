import { ACTION_LABELS, METRIC_LABELS } from '../lib/labels';
import { formatRelativeTime } from '../lib/format';
import type { ProjectSummary } from '../types';
import { SHARE_STATUS_CONFIG } from './constants';
import { ShareStatusBadge } from './ShareStatusBadge';

interface ProjectCardProps {
  project: ProjectSummary;
}

type MetricTone = 'default' | 'confirm' | 'external' | 'internal' | 'unrecorded';

interface MetricItem {
  label: string;
  value: number;
  tone: MetricTone;
}

function metricGridClass(count: number): string {
  if (count >= 4) return 'grid-cols-2 sm:grid-cols-4';
  if (count === 3) return 'grid-cols-3';
  if (count === 2) return 'grid-cols-2';
  return 'grid-cols-1';
}

function MetricCell({ label, value, tone = 'default' }: MetricItem) {
  const valueClass =
    tone === 'confirm'
      ? 'text-amber-700 dark:text-amber-300/90'
      : tone === 'external'
        ? 'obs-metric-value--external'
        : tone === 'internal'
          ? 'obs-metric-value--internal'
          : tone === 'unrecorded'
            ? 'obs-metric-value--unrecorded'
            : 'obs-metric-value';

  return (
    <div className="text-center">
      <p className={`text-2xl font-semibold tabular-nums leading-none ${valueClass}`}>{value}</p>
      <p className="mt-1.5 obs-eyebrow obs-text-muted">{label}</p>
    </div>
  );
}

export function ProjectCard({ project }: ProjectCardProps) {
  const status = SHARE_STATUS_CONFIG[project.shareStatus];
  const topReason = project.statusReasons.find(
    (r) => r.contributesTo === project.shareStatus,
  );

  const metrics: MetricItem[] = (
    [
      {
        label: ACTION_LABELS.needsConfirmation,
        value: project.needsConfirmationCount,
        tone: 'confirm' as const,
      },
      {
        label: ACTION_LABELS.externalWait,
        value: project.externalWaitCount,
        tone: 'external' as const,
      },
      {
        label: ACTION_LABELS.internalWait,
        value: project.internalWaitCount,
        tone: 'internal' as const,
      },
      {
        label: METRIC_LABELS.statusUnrecorded,
        value: project.statusUnrecordedCount,
        tone: 'unrecorded' as const,
      },
    ] satisfies MetricItem[]
  ).filter((m) => m.value > 0);

  return (
    <article
      className={`relative overflow-hidden rounded-lg border bg-gradient-to-br to-[var(--obs-card-to)] p-6 ${status.borderClass} ${status.glowClass}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="obs-card-title">{project.name}</h3>
        </div>
        <ShareStatusBadge status={project.shareStatus} size="sm" />
      </div>

      {topReason && (
        <p className="mt-3 obs-body-sm leading-relaxed obs-text-muted line-clamp-2">
          {topReason.label}
        </p>
      )}

      {metrics.length > 0 && (
        <div
          className={`obs-divider mt-4 grid gap-2 border-t pt-4 ${metricGridClass(metrics.length)}`}
        >
          {metrics.map((m) => (
            <MetricCell key={m.label} {...m} />
          ))}
        </div>
      )}

      <p className="mt-3 obs-caption">
        課題更新 {formatRelativeTime(project.lastIssueUpdatedAt)}
      </p>
    </article>
  );
}
