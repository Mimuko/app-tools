import 'server-only';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DataFreshnessBanner } from '../../components/DataFreshnessBanner';
import { AssigneeLoadPanel } from '../../components/AssigneeLoadPanel';
import { ObservationDisclaimer } from '../../components/ObservationDisclaimer';
import { ConcernCommentsPanel } from '../../components/ConcernCommentsPanel';
import { ContextNotesPanel } from '../../components/ContextNotesPanel';
import { CurrentStatesPanel } from '../../components/CurrentStatesPanel';
import { DirectorPromptsPanel } from '../../components/DirectorPromptsPanel';
import { ObservedIssuesPanel } from '../../components/ObservedIssuesPanel';
import { ObserverShell } from '../../components/ObserverShell';
import { RiskTimeline } from '../../components/RiskTimeline';
import { SafetyReadinessPanel } from '../../components/SafetyReadinessPanel';
import { ShareStatusBadge } from '../../components/ShareStatusBadge';
import { SharingGapPanel } from '../../components/SharingGapPanel';
import { StatusReasonsPanel } from '../../components/StatusReasonsPanel';
import { ACTION_LABELS, METRIC_LABELS } from '../../lib/labels';
import { formatRelativeTime } from '../../lib/format';
import { isUsingLiveBacklog } from '../../lib/load-projects';
import { projectDetailPath } from '../../lib/paths';
import { getProjectDetail } from '../../mock/projects';
import type { ProjectDetail } from '../../types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps) {
  const project = await getProjectDetail(params.id);
  return {
    title: project
      ? `${project.name} | 朝会支援UI`
      : '朝会支援UI',
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const project = await getProjectDetail(params.id);
  if (!project) notFound();

  return (
    <ObserverShell
      title={project.name}
      subtitle={project.clientName}
      actions={<ShareStatusBadge status={project.shareStatus} showMeaning />}
    >
      <ObservationDisclaimer />
      <DataFreshnessBanner dataObservedAt={project.dataObservedAt} />

      {isUsingLiveBacklog() && (
        <p className="obs-live-banner mb-4 rounded px-3 py-2 text-sm">
          Backlog 実データ · {project.id}
        </p>
      )}

      <SafetyReadinessPanel
        shareStatus={project.shareStatus}
        proceedSafety={project.proceedSafety}
        nextActionClarity={project.nextActionClarity}
        sharingObservation={project.sharingObservation}
      />

      <div
        className="obs-surface-muted mb-8 rounded-lg px-5 py-4"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--obs-accent-soft), transparent)',
        }}
      >
        <p className="obs-heading-muted">観測メモ</p>
        <p className="mt-2 text-base leading-relaxed obs-text-secondary">{project.observerNote}</p>
        <p className="mt-3 text-sm obs-text-faint">
          課題更新 {formatRelativeTime(project.lastIssueUpdatedAt)} · 観測{' '}
          {formatRelativeTime(project.dataObservedAt)}
        </p>
      </div>

      <ProjectActionMetrics project={project} />

      <div className="grid gap-6 lg:grid-cols-2">
        <StatusReasonsPanel
          reasons={project.statusReasons}
          activeStatus={project.shareStatus}
        />
        <SharingGapPanel signals={project.stopSignals} />
        <DirectorPromptsPanel prompts={project.directorPrompts} />
        <AssigneeLoadPanel loads={project.assigneeLoads} />
        <ObservedIssuesPanel issues={project.observedIssues} />
        <CurrentStatesPanel states={project.currentStates} />
        <ContextNotesPanel notes={project.contextNotes} />
        <ConcernCommentsPanel comments={project.concernComments} />
        <RiskTimeline events={project.riskTimeline} />
      </div>

      <footer className="mt-10 text-center">
        <Link
          href="/tools/project-observer/"
          className="obs-link text-sm uppercase tracking-widest"
        >
          ← 一覧に戻る
        </Link>
      </footer>
    </ObserverShell>
  );
}

function ProjectActionMetrics({ project }: { project: ProjectDetail }) {
  const pills = [
    { label: ACTION_LABELS.needsConfirmation, value: project.needsConfirmationCount },
    { label: ACTION_LABELS.externalWait, value: project.externalWaitCount },
    { label: ACTION_LABELS.internalWait, value: project.internalWaitCount },
    { label: METRIC_LABELS.statusUnrecorded, value: project.statusUnrecordedCount },
  ].filter((p) => p.value > 0);

  if (pills.length === 0) return null;

  const gridClass =
    pills.length >= 4
      ? 'grid-cols-2 sm:grid-cols-4'
      : pills.length === 3
        ? 'grid-cols-3'
        : pills.length === 2
          ? 'grid-cols-2'
          : 'grid-cols-1';

  return (
    <div className={`mb-8 grid gap-3 sm:max-w-xl ${gridClass}`}>
      {pills.map((p) => (
        <StatPill key={p.label} label={p.label} value={p.value} />
      ))}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  const emphasized = value > 0;
  return (
    <div className="obs-surface-muted rounded-md px-3 py-2 text-center">
      <p
        className={`text-xl tabular-nums ${emphasized ? 'obs-metric-value' : 'obs-metric-value--muted'}`}
      >
        {value}
      </p>
      <p className="text-sm uppercase tracking-wider obs-text-muted">{label}</p>
    </div>
  );
}
