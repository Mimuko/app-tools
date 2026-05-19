import type {
  AssigneeLoad,
  ConcernComment,
  ContextNote,
  CurrentState,
  DirectorActionIssue,
  ObservedIssue,
  RiskTimelineEvent,
} from '../../types';

/** Backlog から取り込む生シグナル（PoC はモック） */
export interface ProjectSignals {
  projectId: string;
  name: string;
  clientName: string;
  /** 案件内の最新課題更新日（Backlog） */
  lastIssueUpdatedAt: string;
  /** バッチ観測時刻（毎日 6:00） */
  dataObservedAt: string;
  /** 課題更新日からの経過（営業日）— 「更新」の定義 */
  businessDaysSinceIssueUpdate: number;
  businessDaysSinceComment: number;
  businessDaysSinceStatusChange: number;
  businessDaysSinceAssigneeChange: number;
  unfixedIssueCount: number;
  provisionalIssueCount: number;
  requirementsUnsetCount: number;
  specUndecidedCount: number;
  /** 案件として次アクションが明記されているか */
  hasDocumentedNextAction: boolean;
  needsReviewCount: number;
  needsConfirmationCount: number;
  externalWaitCount: number;
  internalWaitCount: number;
  statusUnrecordedCount: number;
}

export interface ProjectObservationExtras {
  observerNote: string;
  currentStates: CurrentState[];
  contextNotes: ContextNote[];
  assigneeLoads: AssigneeLoad[];
  directorActionIssues?: DirectorActionIssue[];
  observedIssues: ObservedIssue[];
  concernComments: ConcernComment[];
  riskTimeline: RiskTimelineEvent[];
}
