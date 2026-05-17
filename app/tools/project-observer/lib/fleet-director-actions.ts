import 'server-only';

import { getBacklogIssueUrl } from '@/lib/backlog/issue-url';
import { DIRECTOR_TEAM, isDirector } from './observation/config';
import type {
  DirectorActionIssue,
  FleetDirectorAction,
  ProjectDetail,
  ShareStatus,
} from '../types';

const STATUS_RANK: Record<ShareStatus, number> = {
  attention: 0,
  caution: 1,
  stable: 2,
};

function collectIssues(project: ProjectDetail): DirectorActionIssue[] {
  if (project.directorActionIssues.length > 0) {
    return project.directorActionIssues;
  }

  return project.observedIssues
    .filter((i) => i.assigneeName && isDirector(i.assigneeName))
    .filter((i) => i.awaitingConfirmation || i.unreplied)
    .map((i) => ({
      issueKey: i.issueKey,
      title: i.title,
      assigneeName: i.assigneeName!,
      projectId: project.id,
      projectName: project.name,
      shareStatus: i.shareStatus,
      needsConfirmation: i.awaitingConfirmation,
      awaitingReply: i.unreplied,
    }));
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
          awaitingReplyCount: 0,
          issues: [],
        };
        byDirector.set(member.id, row);
      }

      const issueUrl = getBacklogIssueUrl(raw.issueKey) ?? undefined;
      const existing = row.issues.find((i) => i.issueKey === raw.issueKey);
      if (existing) {
        existing.needsConfirmation ||= raw.needsConfirmation;
        existing.awaitingReply ||= raw.awaitingReply;
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
    row.awaitingReplyCount = row.issues.filter((i) => i.awaitingReply).length;
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
          b.awaitingReplyCount -
          (a.needsConfirmationCount + a.awaitingReplyCount) ||
        a.name.localeCompare(b.name, 'ja'),
    );
}
