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
import { formatRelativeTime } from '../../lib/format';
import { isUsingLiveBacklog } from '../../lib/load-projects';
import { projectDetailPath } from '../../lib/paths';
import { getProjectIdsForStaticParams } from '../../lib/static-params';
import { getProjectDetail } from '../../mock/projects';

interface PageProps {
  params: { id: string };
}

export async function generateStaticParams() {
  const ids = await getProjectIdsForStaticParams();
  return ids.map((id) => ({ id }));
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
        <p className="mb-4 text-sm text-emerald-400/80">
          Backlog 実データ · {project.id}
        </p>
      )}

      <SafetyReadinessPanel
        shareStatus={project.shareStatus}
        proceedSafety={project.proceedSafety}
        nextActionClarity={project.nextActionClarity}
        sharingObservation={project.sharingObservation}
      />

      <div className="mb-8 rounded-lg border border-cyan-900/30 bg-gradient-to-r from-cyan-950/30 to-transparent px-5 py-4">
        <p className="font-mono text-sm uppercase tracking-widest text-cyan-600/70">
          観測メモ
        </p>
        <p className="mt-2 text-base leading-relaxed text-slate-300">{project.observerNote}</p>
        <p className="mt-3 font-mono text-sm text-slate-600">
          課題更新 {formatRelativeTime(project.lastIssueUpdatedAt)} · 観測{' '}
          {formatRelativeTime(project.dataObservedAt)}
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:max-w-2xl">
        <StatPill label="要件未確定" value={project.requirementsUnsetCount} />
        <StatPill label="確認待ち" value={project.awaitingConfirmationCount} />
        <StatPill label="未返信" value={project.unrepliedIssueCount} />
        <StatPill label="要確認" value={project.needsReviewCount} />
      </div>

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
          className="font-mono text-sm uppercase tracking-widest text-cyan-600/70 hover:text-cyan-500"
        >
          ← 一覧に戻る
        </Link>
      </footer>
    </ObserverShell>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  const emphasized = value > 0;
  return (
    <div className="rounded-md border border-cyan-900/25 bg-[#0a1018]/80 px-3 py-2 text-center">
      <p
        className={`font-mono text-xl tabular-nums ${emphasized ? 'text-cyan-300/90' : 'text-slate-600'}`}
      >
        {value}
      </p>
      <p className="text-sm uppercase tracking-wider text-slate-500">{label}</p>
    </div>
  );
}
