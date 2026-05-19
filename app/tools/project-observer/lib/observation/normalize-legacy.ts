import type {
  AssigneeLoad,
  DirectorActionIssue,
  ObservedIssue,
  ProjectSummary,
} from '../../types';
import type { ProjectObservationExtras, ProjectSignals } from './types';

type LegacySignals = Omit<ProjectSignals, 'dataObservedAt'> & {
  awaitingConfirmationCount?: number;
  unrepliedIssueCount?: number;
};

type LegacyDirectorIssue = DirectorActionIssue & {
  awaitingReply?: boolean;
  waitHint?: string;
};

type LegacyObservedIssue = ObservedIssue & {
  awaitingConfirmation?: boolean;
  unreplied?: boolean;
  waitHint?: string | null;
};

export function normalizeProjectSignals(
  signals: LegacySignals,
): Omit<ProjectSignals, 'dataObservedAt'> {
  const base = { ...signals } as LegacySignals & ProjectSignals;
  if (typeof base.externalWaitCount === 'number') {
    const { awaitingConfirmationCount: _a, unrepliedIssueCount: _u, ...rest } = base;
    return {
      ...rest,
      statusUnrecordedCount: rest.statusUnrecordedCount ?? 0,
    };
  }

  return {
    ...base,
    needsConfirmationCount: 0,
    externalWaitCount: 0,
    internalWaitCount: 0,
    statusUnrecordedCount: 0,
  };
}

/** 旧スナップショット — 記法未保存のためアクション系フラグはオフ（再 sync 前提） */
function migrateDirectorIssue(issue: LegacyDirectorIssue): DirectorActionIssue {
  if ('hasNextAction' in issue && issue.externalWait !== undefined) {
    const { awaitingReply: _r, waitHint: _w, ...rest } = issue;
    if (typeof rest.needsOrganization === 'boolean') {
      return rest;
    }
    const hasNotation =
      rest.needsConfirmation ||
      rest.externalWait ||
      rest.internalWait ||
      rest.hasNextAction;
    return {
      ...rest,
      needsOrganization: !hasNotation,
    };
  }

  return {
    issueKey: issue.issueKey,
    title: issue.title,
    assigneeName: issue.assigneeName,
    projectId: issue.projectId,
    projectName: issue.projectName,
    shareStatus: issue.shareStatus,
    needsOrganization: true,
    needsConfirmation: false,
    externalWait: false,
    internalWait: false,
    hasNextAction: false,
    issueUrl: issue.issueUrl,
  };
}

function migrateObservedIssue(issue: LegacyObservedIssue): ObservedIssue {
  if ('hasNextAction' in issue && issue.externalWait !== undefined) {
    const { awaitingConfirmation: _a, unreplied: _u, waitHint: _w, ...rest } = issue;
    return rest;
  }

  return {
    id: issue.id,
    issueKey: issue.issueKey,
    title: issue.title,
    assigneeName: issue.assigneeName,
    shareStatus: issue.shareStatus,
    reasons: issue.reasons,
    needsConfirmation: false,
    externalWait: false,
    internalWait: false,
    hasNextAction: false,
    nextActionText: issue.nextActionText,
    nextActionValid: false,
  };
}

function migrateAssigneeLoad(load: AssigneeLoad & {
  awaitingConfirmationCount?: number;
  unrepliedIssueCount?: number;
}): AssigneeLoad {
  if (typeof load.externalWaitCount === 'number') {
    const { awaitingConfirmationCount: _a, unrepliedIssueCount: _u, ...rest } = load;
    return rest;
  }
  return {
    ...load,
    needsConfirmationCount: 0,
    externalWaitCount: 0,
    internalWaitCount: 0,
  };
}

export function normalizeObservationRecord(record: {
  signals: LegacySignals;
  extras: ProjectObservationExtras;
}): {
  signals: Omit<ProjectSignals, 'dataObservedAt'>;
  extras: ProjectObservationExtras;
} {
  const signals = normalizeProjectSignals(record.signals);
  const extras = record.extras;

  return {
    signals,
    extras: {
      ...extras,
      assigneeLoads: extras.assigneeLoads.map(migrateAssigneeLoad),
      observedIssues: extras.observedIssues.map(migrateObservedIssue),
      directorActionIssues: (extras.directorActionIssues ?? []).map(migrateDirectorIssue),
    },
  };
}

export function normalizeProjectSummary(summary: ProjectSummary & {
  awaitingConfirmationCount?: number;
  unrepliedIssueCount?: number;
}): ProjectSummary {
  if (typeof summary.externalWaitCount === 'number') {
    const { awaitingConfirmationCount: _a, unrepliedIssueCount: _u, ...rest } = summary;
    return {
      ...rest,
      statusUnrecordedCount: rest.statusUnrecordedCount ?? 0,
    };
  }
  return {
    ...summary,
    needsConfirmationCount: 0,
    externalWaitCount: 0,
    internalWaitCount: 0,
    statusUnrecordedCount: 0,
  };
}
