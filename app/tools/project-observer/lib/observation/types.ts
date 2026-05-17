import type {
  AssigneeLoad,
  ConcernComment,
  ContextNote,
  CurrentState,
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
  /** 担当が社内ディレクターかつ注意/要注目の課題 — 要確認 */
  needsReviewCount: number;
  /** 確認待ち（社内が投げたまま） */
  awaitingConfirmationCount: number;
  /** 最終コメントが社内ユーザ — 未返信 */
  unrepliedIssueCount: number;
}

export interface ProjectObservationExtras {
  observerNote: string;
  currentStates: CurrentState[];
  contextNotes: ContextNote[];
  assigneeLoads: AssigneeLoad[];
  observedIssues: ObservedIssue[];
  concernComments: ConcernComment[];
  riskTimeline: RiskTimelineEvent[];
}
