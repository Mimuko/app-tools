import {
  buildDirectorPrompts as buildPromptList,
  buildSharingObservation,
  buildStopSignals,
  countAttentionIssues,
  enrichAssigneeLoads,
  resolveNextActionClarity,
  resolveProceedSafety,
  resolveShareStatus,
  sortByShareStatus,
} from './observation/evaluate';
import type { ProjectObservationExtras } from './observation/types';
import type { ProjectSignals } from './observation/types';
import type { DirectorPrompt, ProjectDetail, ProjectSummary } from '../types';

export function evaluateProjectRecord(
  rawSignals: Omit<ProjectSignals, 'dataObservedAt'>,
  extras: ProjectObservationExtras,
  dataObservedAt: string,
): ProjectDetail {
  const signals = { ...rawSignals, dataObservedAt };
  const { shareStatus, statusReasons } = resolveShareStatus(signals);
  const nextActionClarity = resolveNextActionClarity(signals);
  const proceedSafety = resolveProceedSafety(shareStatus, nextActionClarity);
  const stopSignals = buildStopSignals(signals);
  const assigneeLoads = enrichAssigneeLoads(extras.assigneeLoads);

  const directorPrompts = buildDirectorPromptsForProject(signals.projectId, {
    ...extras,
    assigneeLoads,
  });

  const summary: ProjectSummary = {
    id: signals.projectId,
    name: signals.name,
    clientName: signals.clientName,
    shareStatus,
    requirementsUnsetCount: signals.requirementsUnsetCount,
    awaitingConfirmationCount: signals.awaitingConfirmationCount,
    unrepliedIssueCount: signals.unrepliedIssueCount,
    needsReviewCount: signals.needsReviewCount,
    attentionIssueCount: countAttentionIssues(signals),
    nextActionClarity,
    proceedSafety,
    sharingObservation: buildSharingObservation(shareStatus, statusReasons),
    lastIssueUpdatedAt: signals.lastIssueUpdatedAt,
    dataObservedAt: signals.dataObservedAt,
    statusReasons,
  };

  const contextNotes = [
    ...extras.contextNotes,
    ...stopSignals.map((s, i) => ({
      id: `stop-${i}`,
      category: 'sharing_gap' as const,
      title: s.label,
      detail: s.daysSilent != null ? `${s.daysSilent} 営業日相当` : '共有・次アクションの観測',
    })),
  ];

  return {
    ...summary,
    observerNote: extras.observerNote,
    currentStates: extras.currentStates,
    contextNotes,
    assigneeLoads,
    observedIssues: extras.observedIssues,
    stopSignals,
    directorPrompts,
    concernComments: extras.concernComments,
    riskTimeline: extras.riskTimeline,
  };
}

function buildDirectorPromptsForProject(
  projectId: string,
  extras: ProjectObservationExtras & { assigneeLoads: ProjectDetail['assigneeLoads'] },
): DirectorPrompt[] {
  const fromAssignee: Omit<DirectorPrompt, 'id'>[] = extras.assigneeLoads
    .filter((a) => a.suggestedNext)
    .map((a) => ({
      priority:
        a.needsReviewCount + a.unrepliedIssueCount > 2
          ? ('high' as const)
          : ('medium' as const),
      source: 'assignee_change' as const,
      issueKey: extras.observedIssues[0]?.issueKey ?? `${projectId}-0`,
      summary: a.suggestedNext!,
      forDirector: a.name,
    }));

  const fromIssues: Omit<DirectorPrompt, 'id'>[] = extras.observedIssues
    .filter((i) => i.shareStatus !== 'stable')
    .slice(0, 3)
    .map((issue) => ({
      priority: issue.shareStatus === 'attention' ? ('high' as const) : ('medium' as const),
      source: 'status_change' as const,
      issueKey: issue.issueKey,
      summary: `${issue.title} — ${issue.reasons.join('、')}`,
      forDirector: extras.assigneeLoads[0]?.name ?? '担当ディレクター',
    }));

  return buildPromptList([...fromIssues, ...fromAssignee].slice(0, 5));
}

export function evaluateAllRecords(
  records: Array<{
    signals: Omit<ProjectSignals, 'dataObservedAt'>;
    extras: ProjectObservationExtras;
  }>,
  dataObservedAt: string,
): ProjectDetail[] {
  return records.map((r) => evaluateProjectRecord(r.signals, r.extras, dataObservedAt));
}

export function sortProjects(projects: ProjectDetail[]): ProjectDetail[] {
  return sortByShareStatus(projects);
}
