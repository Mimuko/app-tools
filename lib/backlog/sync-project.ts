import {
  DIRECTOR_TEAM,
  isDirectorTeamScopedIssue,
} from '@/app/tools/project-observer/lib/observation/config';
import { isExcludedObservationIssueTitle } from '@/app/tools/project-observer/lib/observation/issue-exclusions';
import { isAllowedObservationIssueStatus } from '@/app/tools/project-observer/lib/observation/issue-status-scope';
import type { ProjectObservationExtras } from '@/app/tools/project-observer/lib/observation/types';
import type { ProjectSignals } from '@/app/tools/project-observer/lib/observation/types';
import type {
  AssigneeLoad,
  ConcernComment,
  ContextNote,
  CurrentState,
  DirectorActionIssue,
  ObservedIssue,
  RiskTimelineEvent,
} from '@/app/tools/project-observer/types';
import { businessDaysSince } from './business-days';
import { findLatestFieldChangeAt, maxIsoDate } from './change-log';
import {
  getAllIssues,
  getIssueComments,
  getProject,
  getProjectStatuses,
  type BacklogIssue,
} from './client';
import { getInternalEmailDomain } from './env';
import {
  issueReasons,
  issueShareStatus,
  isAttentionKeywordHit,
  scanIssue,
} from './issue-signals';
import { stripBacklogMarkup } from './text';

const COMMENT_FETCH_LIMIT = 40;
/** changeLog から状態・担当変更を拾うため、シグナル解析より多めに取得 */
const COMMENT_COUNT_FOR_SYNC = 50;

export interface SyncedProjectRecord {
  signals: Omit<ProjectSignals, 'dataObservedAt'>;
  extras: ProjectObservationExtras;
}

function isInternalUser(user: { mailAddress?: string; name: string }): boolean {
  const domain = getInternalEmailDomain();
  if (user.mailAddress?.toLowerCase().endsWith(`@${domain.toLowerCase()}`)) {
    return true;
  }
  return DIRECTOR_TEAM.some((d) => d.backlogName === user.name);
}

function issueStatusName(issue: BacklogIssue, statusNames: Map<number, string>): string {
  return issue.status?.name ?? statusNames.get(issue.status.id) ?? '';
}

function initDirectorLoads(): Map<string, AssigneeLoad> {
  const map = new Map<string, AssigneeLoad>();
  for (const d of DIRECTOR_TEAM) {
    map.set(d.id, {
      id: d.id,
      name: d.backlogName,
      roleLabel: 'ディレクション',
      awaitingConfirmationCount: 0,
      unrepliedIssueCount: 0,
      needsReviewCount: 0,
      attentionIssueCount: 0,
      cognitiveLoad: 'light',
    });
  }
  return map;
}

function findDirectorId(assigneeName: string | undefined): string | undefined {
  if (!assigneeName) return undefined;
  return DIRECTOR_TEAM.find((d) => d.backlogName === assigneeName)?.id;
}

export async function syncProjectFromBacklog(
  projectKey: string,
  observedAt: Date,
): Promise<SyncedProjectRecord> {
  const project = await getProject(projectKey);
  const statuses = await getProjectStatuses(project.id);
  const statusNames = new Map(statuses.map((s) => [s.id, s.name]));

  const issues = await getAllIssues(project.id);
  const activeIssues = issues.filter((i) => {
    const status = issueStatusName(i, statusNames);
    return (
      isAllowedObservationIssueStatus(status) &&
      !isExcludedObservationIssueTitle(i.summary) &&
      isDirectorTeamScopedIssue(i)
    );
  });

  let lastIssueUpdatedAt = project.archived ? observedAt.toISOString() : '1970-01-01T00:00:00Z';
  let lastCommentAt: string | null = null;
  let lastStatusAt: string | null = null;
  let lastAssigneeAt: string | null = null;

  for (const issue of activeIssues) {
    if (new Date(issue.updated) > new Date(lastIssueUpdatedAt)) {
      lastIssueUpdatedAt = issue.updated;
    }
  }

  const issuesForComments = [...activeIssues]
    .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
    .slice(0, COMMENT_FETCH_LIMIT);

  const issueScans: Array<{
    issue: BacklogIssue;
    comments: Awaited<ReturnType<typeof getIssueComments>>;
    scan: ReturnType<typeof scanIssue>;
  }> = [];

  for (const issue of issuesForComments) {
    const comments = await getIssueComments(issue.issueKey, COMMENT_COUNT_FOR_SYNC);
    const scan = scanIssue(issue, comments, isInternalUser);
    issueScans.push({ issue, comments, scan });
    await new Promise((r) => setTimeout(r, 80));
  }

  let unfixedIssueCount = 0;
  let provisionalIssueCount = 0;
  let requirementsUnsetCount = 0;
  let specUndecidedCount = 0;
  let unrepliedIssueCount = 0;
  let needsReviewCount = 0;
  let awaitingConfirmationCount = 0;

  const directorLoads = initDirectorLoads();
  const observedIssues: ObservedIssue[] = [];
  const directorActionIssues: DirectorActionIssue[] = [];
  const concernComments: ConcernComment[] = [];
  const currentStatesMap = new Map<string, CurrentState>();

  for (const { issue, comments, scan } of issueScans) {
    if (new Date(issue.updated) > new Date(lastIssueUpdatedAt)) {
      lastIssueUpdatedAt = issue.updated;
    }
    if (scan.lastCommentAt && (!lastCommentAt || scan.lastCommentAt > lastCommentAt)) {
      lastCommentAt = scan.lastCommentAt;
    }
    lastStatusAt = maxIsoDate(lastStatusAt, findLatestFieldChangeAt(comments, 'status'));
    lastAssigneeAt = maxIsoDate(lastAssigneeAt, findLatestFieldChangeAt(comments, 'assignee'));

    if (scan.unfixed) unfixedIssueCount++;
    if (scan.provisional) provisionalIssueCount++;
    if (scan.requirementsUnset) requirementsUnsetCount++;
    if (scan.specUndecided) specUndecidedCount++;

    const directorId = findDirectorId(issue.assignee?.name);
    const issueStatus = issueShareStatus(scan);

    if (scan.lastCommentInternal && directorId) {
      unrepliedIssueCount++;
      const load = directorLoads.get(directorId);
      if (load) load.unrepliedIssueCount++;
    }

    if (directorId && (issueStatus === 'attention' || issueStatus === 'caution')) {
      needsReviewCount++;
      const load = directorLoads.get(directorId);
      if (load) load.needsReviewCount++;
    }

    if (directorId && scan.lastCommentInternal) {
      awaitingConfirmationCount++;
      const load = directorLoads.get(directorId);
      if (load) load.awaitingConfirmationCount++;
    }

    if (directorId && issueStatus === 'attention') {
      const load = directorLoads.get(directorId);
      if (load) load.attentionIssueCount++;
    }

    const needsConfirmation = Boolean(
      directorId &&
        (scan.lastCommentInternal ||
          issueStatus === 'attention' ||
          issueStatus === 'caution'),
    );
    const awaitingReply = Boolean(directorId && scan.lastCommentInternal);

    if (directorId && (needsConfirmation || awaitingReply)) {
      directorActionIssues.push({
        issueKey: issue.issueKey,
        title: issue.summary,
        assigneeName: issue.assignee!.name,
        projectId: project.projectKey,
        projectName: project.name,
        shareStatus: issueStatus,
        needsConfirmation,
        awaitingReply,
      });
    }

    if (issueStatus !== 'stable' || isAttentionKeywordHit(stripBacklogMarkup(issue.description))) {
      observedIssues.push({
        id: String(issue.id),
        issueKey: issue.issueKey,
        title: issue.summary,
        assigneeName: issue.assignee?.name ?? null,
        shareStatus: issueStatus,
        reasons: issueReasons(scan),
        awaitingConfirmation: needsConfirmation,
        unreplied: awaitingReply,
        nextActionText: scan.nextActionText,
        nextActionValid: scan.nextActionValid,
      });
    }

    if (scan.provisional && !currentStatesMap.has('provisional')) {
      currentStatesMap.set('provisional', {
        kind: 'provisional',
        label: '暫定対応',
        note: `${issue.issueKey} ほか`,
      });
    }
    if (scan.unfixed && !currentStatesMap.has('undecided')) {
      currentStatesMap.set('undecided', {
        kind: 'undecided',
        label: '未FIX',
        note: `${issue.issueKey} ほか`,
      });
    }
    if (!scan.nextActionValid && !currentStatesMap.has('client_pending')) {
      currentStatesMap.set('client_pending', {
        kind: 'client_pending',
        label: '次アクション要整理',
        note: '主体+行動の明記が必要な課題あり',
      });
    }

    if (isAttentionKeywordHit(stripBacklogMarkup(issue.description)) || scan.provisional || scan.unfixed) {
      const excerpt = scan.nextActionText || issue.summary.slice(0, 80);
      if (concernComments.length < 6) {
        concernComments.push({
          id: `c-${issue.id}`,
          excerpt,
          issueKey: issue.issueKey,
          author: scan.lastCommentAuthor ?? issue.assignee?.name ?? '—',
          postedAt: scan.lastCommentAt ?? issue.updated,
          signal: scan.provisional ? 'provisional' : scan.unfixed ? 'unfixed' : 'pending_reply',
        });
      }
    }
  }

  const hasDocumentedNextAction = issueScans.some((x) => x.scan.nextActionValid);

  const signals: Omit<ProjectSignals, 'dataObservedAt'> = {
    projectId: project.projectKey,
    name: project.name,
    clientName: project.name,
    lastIssueUpdatedAt,
    businessDaysSinceIssueUpdate: businessDaysSince(lastIssueUpdatedAt, observedAt),
    businessDaysSinceComment: lastCommentAt
      ? businessDaysSince(lastCommentAt, observedAt)
      : businessDaysSince(lastIssueUpdatedAt, observedAt),
    businessDaysSinceStatusChange: businessDaysSince(
      lastStatusAt ?? lastIssueUpdatedAt,
      observedAt,
    ),
    businessDaysSinceAssigneeChange: businessDaysSince(
      lastAssigneeAt ?? lastIssueUpdatedAt,
      observedAt,
    ),
    unfixedIssueCount,
    provisionalIssueCount,
    requirementsUnsetCount,
    specUndecidedCount,
    hasDocumentedNextAction,
    needsReviewCount,
    awaitingConfirmationCount,
    unrepliedIssueCount,
  };

  const riskTimeline: RiskTimelineEvent[] = issueScans
    .filter((x) => x.scan.provisional || x.scan.unfixed)
    .slice(0, 5)
    .map((x, i) => ({
      id: `t-${x.issue.id}`,
      kind: x.scan.provisional ? ('provisional_fix' as const) : ('rework' as const),
      title: x.issue.summary.slice(0, 60),
      description: x.scan.nextActionText || '要注目シグナル検出',
      occurredAt: x.issue.updated,
    }));

  observedIssues.sort((a, b) => {
    const order = { attention: 0, caution: 1, stable: 2 };
    return order[a.shareStatus] - order[b.shareStatus];
  });

  const extras: ProjectObservationExtras = {
    observerNote: `Backlog実データ（${project.projectKey}）。ディレクター関連アクティブ課題 ${activeIssues.length} 件、コメント解析 ${issueScans.length} 件。`,
    currentStates: [...currentStatesMap.values()],
    contextNotes: [],
    assigneeLoads: [...directorLoads.values()].filter(
      (l) =>
        l.awaitingConfirmationCount +
          l.unrepliedIssueCount +
          l.needsReviewCount +
          l.attentionIssueCount >
        0,
    ),
    observedIssues: observedIssues.slice(0, 8),
    directorActionIssues,
    concernComments,
    riskTimeline,
  };

  return { signals, extras };
}
