/** 全体共有用ステータス（優先: 要注目 > 注意 > 安定） */
export type ShareStatus = 'attention' | 'caution' | 'stable';

export type NextActionClarity = 'clear' | 'partial' | 'unclear';
export type ProceedSafety = 'safe' | 'careful' | 'hold';

export type StatusReasonCode =
  | 'unfixed'
  | 'requirements_unset'
  | 'spec_undecided'
  | 'provisional'
  | 'next_action_missing'
  | 'no_issue_update'
  | 'no_comment'
  | 'no_status_change'
  | 'no_assignee_change'
  | 'next_action_unclear'
  | 'sharing_invisible'
  | 'sharing_ok';

export interface StatusReason {
  code: StatusReasonCode;
  contributesTo: ShareStatus;
  label: string;
}

export type StopSignalKind =
  | 'no_issue_update'
  | 'no_comment'
  | 'no_status_change'
  | 'no_assignee_change'
  | 'next_action_unclear';

export interface StopSignal {
  id: string;
  kind: StopSignalKind;
  label: string;
  daysSilent?: number;
}

export type DirectorPromptSource = 'status_change' | 'assignee_change' | 'comment_signal';

export interface DirectorPrompt {
  id: string;
  priority: 'high' | 'medium';
  source: DirectorPromptSource;
  issueKey: string;
  summary: string;
  /** 課題担当（ディレクターチーム＝観測スコープ内の Backlog 担当者名） */
  forDirector?: string;
  /** サーバーで付与 — Backlog 課題詳細 URL */
  issueUrl?: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  clientName: string;
  shareStatus: ShareStatus;
  requirementsUnsetCount: number;
  /** ディレクター判断が必要な課題数 */
  needsConfirmationCount: number;
  /** 外部待ち（整理済み待機） */
  externalWaitCount: number;
  /** 社内待ち（整理済み待機） */
  internalWaitCount: number;
  /** コメント記法が未記載のディレクター担当課題数 */
  statusUnrecordedCount: number;
  needsReviewCount: number;
  attentionIssueCount: number;
  nextActionClarity: NextActionClarity;
  proceedSafety: ProceedSafety;
  sharingObservation: string;
  /** 案件内最新の Backlog 課題更新日 */
  lastIssueUpdatedAt: string;
  /** バッチ観測時刻（毎日 6:00） */
  dataObservedAt: string;
  statusReasons: StatusReason[];
}

export type CurrentStateKind =
  | 'undecided'
  | 'client_pending'
  | 'provisional'
  | 'implementation_risk'
  | 'ops_concern';

export interface CurrentState {
  kind: CurrentStateKind;
  label: string;
  note: string;
}

export interface ContextNote {
  id: string;
  category: 'why_blocked' | 'sharing_gap' | 'alignment';
  title: string;
  detail: string;
}

export type CognitiveLoadLevel = 'high' | 'elevated' | 'moderate' | 'light';

/** 負荷 = 要確認 + 要注目系（待機は危険カウントに含めない） */
export interface AssigneeLoad {
  id: string;
  name: string;
  roleLabel: string;
  needsConfirmationCount: number;
  externalWaitCount: number;
  internalWaitCount: number;
  needsReviewCount: number;
  attentionIssueCount: number;
  cognitiveLoad: CognitiveLoadLevel;
  suggestedNext?: string;
}

/** 担当者別の割り当て課題（案件横断・コメント記法あり） */
export interface DirectorActionIssue {
  issueKey: string;
  title: string;
  assigneeName: string;
  projectId: string;
  projectName: string;
  shareStatus: ShareStatus;
  needsConfirmation: boolean;
  externalWait: boolean;
  internalWait: boolean;
  hasNextAction: boolean;
  /** コメント記法なし（要整理課題） */
  needsOrganization: boolean;
  /** `要確認：` の本文 */
  needsReviewNote?: string | null;
  waitingExternalNote?: string | null;
  waitingInternalNote?: string | null;
  nextActionNote?: string | null;
  issueUrl?: string;
}

export interface FleetDirectorAction {
  assigneeId: string;
  name: string;
  needsConfirmationCount: number;
  externalWaitCount: number;
  internalWaitCount: number;
  needsOrganizationCount: number;
  issues: DirectorActionIssue[];
}

export interface ObservedIssue {
  id: string;
  issueKey: string;
  title: string;
  /** Backlog 課題の担当者表示名 */
  assigneeName?: string | null;
  shareStatus: ShareStatus;
  /** 観測理由（短文） */
  reasons: string[];
  needsConfirmation: boolean;
  externalWait: boolean;
  internalWait: boolean;
  hasNextAction: boolean;
  needsReviewNote?: string | null;
  waitingExternalNote?: string | null;
  waitingInternalNote?: string | null;
  /** `次アクション：` の本文（記法） */
  nextActionText?: string;
  nextActionValid?: boolean;
}

export interface ConcernComment {
  id: string;
  excerpt: string;
  issueKey: string;
  author: string;
  postedAt: string;
  signal: 'provisional' | 'unfixed' | 'ops' | 'pending_reply';
}

export type RiskEventKind = 'spec_change' | 'rework' | 'provisional_fix';

export interface RiskTimelineEvent {
  id: string;
  kind: RiskEventKind;
  title: string;
  description: string;
  occurredAt: string;
}

export interface ProjectDetail extends ProjectSummary {
  observerNote: string;
  currentStates: CurrentState[];
  contextNotes: ContextNote[];
  assigneeLoads: AssigneeLoad[];
  directorActionIssues: DirectorActionIssue[];
  observedIssues: ObservedIssue[];
  stopSignals: StopSignal[];
  directorPrompts: DirectorPrompt[];
  concernComments: ConcernComment[];
  riskTimeline: RiskTimelineEvent[];
}

export interface FleetAssigneeSnapshot {
  assigneeId: string;
  name: string;
  roleLabel: string;
  projectNames: string[];
  totalNeedsConfirmation: number;
  totalExternalWait: number;
  totalInternalWait: number;
  totalNeedsReview: number;
  totalAttentionIssues: number;
  cognitiveLoad: CognitiveLoadLevel;
  topPrompt?: string;
}
