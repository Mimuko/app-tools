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
  /** 確認を促すディレクター（PoC: 名前） */
  forDirector: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  clientName: string;
  shareStatus: ShareStatus;
  requirementsUnsetCount: number;
  awaitingConfirmationCount: number;
  unrepliedIssueCount: number;
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

/** 負荷 = 確認待ち + 未返信 + 要確認（課題数・工数は主指標にしない） */
export interface AssigneeLoad {
  id: string;
  name: string;
  roleLabel: string;
  awaitingConfirmationCount: number;
  unrepliedIssueCount: number;
  needsReviewCount: number;
  attentionIssueCount: number;
  cognitiveLoad: CognitiveLoadLevel;
  suggestedNext?: string;
}

export interface ObservedIssue {
  id: string;
  issueKey: string;
  title: string;
  shareStatus: ShareStatus;
  /** 観測理由（短文） */
  reasons: string[];
  awaitingConfirmation: boolean;
  unreplied: boolean;
  /** 課題上の次アクション記載 */
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
  totalAwaitingConfirmation: number;
  totalUnreplied: number;
  totalNeedsReview: number;
  totalAttentionIssues: number;
  cognitiveLoad: CognitiveLoadLevel;
  topPrompt?: string;
}
