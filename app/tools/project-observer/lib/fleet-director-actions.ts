import 'server-only';

import { getBacklogIssueUrl } from '@/lib/backlog/issue-url';
import { DIRECTOR_TEAM, isDirector } from './observation/config';
import type {
  DirectorActionIssue,
  FleetDirectorAction,
  ObservedIssue,
  ProjectDetail,
  ShareStatus,
} from '../types';

const STATUS_RANK: Record<ShareStatus, number> = {
  attention: 0,
  caution: 1,
  stable: 2,
};

function observedToDirectorIssue(
  issue: ObservedIssue,
  project: ProjectDetail,
): DirectorActionIssue {
  const hasNotation =
    issue.needsConfirmation ||
    issue.externalWait ||
    issue.internalWait ||
    issue.hasNextAction;
  return {
    issueKey: issue.issueKey,
    title: issue.title,
    assigneeName: issue.assigneeName!,
    projectId: project.id,
    projectName: project.name,
    shareStatus: issue.shareStatus,
    needsOrganization: !hasNotation,
    needsConfirmation: issue.needsConfirmation,
    externalWait: issue.externalWait,
    internalWait: issue.internalWait,
    hasNextAction: issue.hasNextAction,
    needsReviewNote: issue.needsReviewNote,
    waitingExternalNote: issue.waitingExternalNote,
    waitingInternalNote: issue.waitingInternalNote,
    nextActionNote: issue.nextActionText ?? null,
  };
}

function collectIssues(project: ProjectDetail): DirectorActionIssue[] {
  if (project.directorActionIssues.length > 0) {
    return project.directorActionIssues;
  }

  return project.observedIssues
    .filter((i) => i.assigneeName && isDirector(i.assigneeName))
    .map((i) => observedToDirectorIssue(i, project));
}

export function buildFleetDirectorActions(projects: ProjectDetail[]): FleetDirectorAction[] {
  const byDirector = new Map<string, FleetDirectorAction>();

  for (const project of projects) {
    for (const raw of collectIssues(project)) {
      const member = DIRECTOR_TEAM.find((d) => d.backlogName === raw.assigneeName);
      if (!member) continue;

      let row = byDirector.get(member.id);
      if (!row) {
        row = {
          assigneeId: member.id,
          name: member.backlogName,
          needsConfirmationCount: 0,
          externalWaitCount: 0,
          internalWaitCount: 0,
          needsOrganizationCount: 0,
          issues: [],
        };
        byDirector.set(member.id, row);
      }

      const issueUrl = getBacklogIssueUrl(raw.issueKey) ?? undefined;
      const existing = row.issues.find((i) => i.issueKey === raw.issueKey);
      if (existing) {
        existing.needsOrganization ||= raw.needsOrganization;
        existing.needsConfirmation ||= raw.needsConfirmation;
        existing.externalWait ||= raw.externalWait;
        existing.internalWait ||= raw.internalWait;
        existing.hasNextAction ||= raw.hasNextAction;
        if (STATUS_RANK[raw.shareStatus] < STATUS_RANK[existing.shareStatus]) {
          existing.shareStatus = raw.shareStatus;
        }
        continue;
      }

      row.issues.push({ ...raw, issueUrl });
    }
  }

  for (const row of byDirector.values()) {
    row.needsConfirmationCount = row.issues.filter((i) => i.needsConfirmation).length;
    row.externalWaitCount = row.issues.filter((i) => i.externalWait).length;
    row.internalWaitCount = row.issues.filter((i) => i.internalWait).length;
    row.needsOrganizationCount = row.issues.filter((i) => i.needsOrganization).length;
    row.issues.sort(
      (a, b) =>
        STATUS_RANK[a.shareStatus] - STATUS_RANK[b.shareStatus] ||
        a.issueKey.localeCompare(b.issueKey),
    );
  }

  return [...byDirector.values()]
    .filter((r) => r.issues.length > 0)
    .sort(
      (a, b) =>
        b.needsConfirmationCount +
          b.externalWaitCount +
          b.internalWaitCount +
          b.needsOrganizationCount -
          (a.needsConfirmationCount +
            a.externalWaitCount +
            a.internalWaitCount +
            a.needsOrganizationCount) ||
        a.name.localeCompare(b.name, 'ja'),
    );
}
