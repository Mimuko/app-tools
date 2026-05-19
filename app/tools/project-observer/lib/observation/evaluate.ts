import { OBSERVATION_CONFIG } from './config';
import type { ProjectSignals } from './types';
import type {
  AssigneeLoad,
  CognitiveLoadLevel,
  DirectorPrompt,
  NextActionClarity,
  ProceedSafety,
  ShareStatus,
  StatusReason,
  StopSignal,
} from '../../types';

const STATUS_RANK: Record<ShareStatus, number> = {
  attention: 0,
  caution: 1,
  stable: 2,
};

const { staleBusinessDays } = OBSERVATION_CONFIG;

function collectAttentionReasons(s: ProjectSignals): StatusReason[] {
  const reasons: StatusReason[] = [];

  if (s.unfixedIssueCount > 0) {
    reasons.push({
      code: 'unfixed',
      contributesTo: 'attention',
      label: `未FIXの論点が ${s.unfixedIssueCount} 件（新規未対応は含まない）`,
    });
  }
  if (s.provisionalIssueCount > 0) {
    reasons.push({
      code: 'provisional',
      contributesTo: 'attention',
      label: `暫定・一旦対応の論点が ${s.provisionalIssueCount} 件`,
    });
  }
  if (s.requirementsUnsetCount > 0) {
    reasons.push({
      code: 'requirements_unset',
      contributesTo: 'attention',
      label: `要件未確定の論点が ${s.requirementsUnsetCount} 件`,
    });
  }
  if (s.specUndecidedCount > 0) {
    reasons.push({
      code: 'spec_undecided',
      contributesTo: 'attention',
      label: `仕様未決の論点が ${s.specUndecidedCount} 件`,
    });
  }
  if (!s.hasDocumentedNextAction) {
    reasons.push({
      code: 'next_action_missing',
      contributesTo: 'attention',
      label: '次アクションが明記されていない（主体+行動が必要）',
    });
  }

  return reasons;
}

function collectCautionReasons(s: ProjectSignals): StatusReason[] {
  const reasons: StatusReason[] = [];
  const stale = s.businessDaysSinceIssueUpdate >= staleBusinessDays;
  const noComment = s.businessDaysSinceComment >= staleBusinessDays;
  const noStatus = s.businessDaysSinceStatusChange >= staleBusinessDays;
  const noAssignee = s.businessDaysSinceAssigneeChange >= staleBusinessDays;
  const noNext = !s.hasDocumentedNextAction;

  if (stale) {
    reasons.push({
      code: 'no_issue_update',
      contributesTo: 'caution',
      label: `課題更新から ${s.businessDaysSinceIssueUpdate} 営業日（${staleBusinessDays}営業日以上で共有不足）`,
    });
  }
  if (noComment) {
    reasons.push({
      code: 'no_comment',
      contributesTo: 'caution',
      label: `コメント更新が ${s.businessDaysSinceComment} 営業日ありません`,
    });
  }
  if (noStatus) {
    reasons.push({
      code: 'no_status_change',
      contributesTo: 'caution',
      label: `状態更新が ${s.businessDaysSinceStatusChange} 営業日ありません`,
    });
  }
  if (noAssignee) {
    reasons.push({
      code: 'no_assignee_change',
      contributesTo: 'caution',
      label: `担当者変更が ${s.businessDaysSinceAssigneeChange} 営業日ありません`,
    });
  }
  if (noNext) {
    reasons.push({
      code: 'next_action_unclear',
      contributesTo: 'caution',
      label: '次アクションが明記されていない',
    });
  }

  const allCautionStale = stale && noComment && noStatus && noAssignee && noNext;
  if (allCautionStale && reasons.length > 0) {
    return [
      {
        code: 'sharing_invisible',
        contributesTo: 'caution',
        label: `状況共有が ${staleBusinessDays} 営業日以上途切れており、現在状態が見えづらい`,
      },
      ...reasons,
    ];
  }

  return reasons;
}

function collectStableReasons(
  s: ProjectSignals,
  hasAttention: boolean,
): StatusReason[] {
  if (hasAttention) return [];
  const fresh = s.businessDaysSinceIssueUpdate < staleBusinessDays;
  const hasNext = s.hasDocumentedNextAction;
  if (fresh && hasNext) {
    return [
      {
        code: 'sharing_ok',
        contributesTo: 'stable',
        label: `${staleBusinessDays}営業日以内に更新があり、次アクションが明記されている`,
      },
    ];
  }
  return [];
}

/** 要注目 > 注意 > 安定 */
export function resolveShareStatus(signals: ProjectSignals): {
  shareStatus: ShareStatus;
  statusReasons: StatusReason[];
} {
  const attention = collectAttentionReasons(signals);
  const hasAttention = attention.length > 0;

  if (hasAttention) {
    const caution = collectCautionReasons(signals).filter(
      (r) => r.code !== 'sharing_invisible',
    );
    return {
      shareStatus: 'attention',
      statusReasons: [...attention, ...caution],
    };
  }

  const caution = collectCautionReasons(signals);
  const cautionTriggers = caution.filter((r) => r.contributesTo === 'caution');
  const allStale =
    signals.businessDaysSinceIssueUpdate >= staleBusinessDays &&
    signals.businessDaysSinceComment >= staleBusinessDays &&
    signals.businessDaysSinceStatusChange >= staleBusinessDays &&
    signals.businessDaysSinceAssigneeChange >= staleBusinessDays &&
    !signals.hasDocumentedNextAction;

  if (allStale || cautionTriggers.length >= 2) {
    return { shareStatus: 'caution', statusReasons: caution };
  }

  const stable = collectStableReasons(signals, false);
  if (stable.length > 0) {
    return { shareStatus: 'stable', statusReasons: [...stable, ...cautionTriggers] };
  }

  if (cautionTriggers.length > 0) {
    return { shareStatus: 'caution', statusReasons: caution };
  }

  return {
    shareStatus: 'stable',
    statusReasons: [
      {
        code: 'sharing_ok',
        contributesTo: 'stable',
        label: '要注目条件に該当せず、観測上は把握可能',
      },
    ],
  };
}

export function buildStopSignals(signals: ProjectSignals): StopSignal[] {
  const out: StopSignal[] = [];

  if (signals.businessDaysSinceIssueUpdate >= staleBusinessDays) {
    out.push({
      id: 'stop-update',
      kind: 'no_issue_update',
      label: '課題更新日ベースで、状況共有が行われていない',
      daysSilent: signals.businessDaysSinceIssueUpdate,
    });
  }
  if (signals.businessDaysSinceComment >= staleBusinessDays) {
    out.push({
      id: 'stop-comment',
      kind: 'no_comment',
      label: 'コメントによる共有が途切れている',
      daysSilent: signals.businessDaysSinceComment,
    });
  }
  if (signals.businessDaysSinceStatusChange >= staleBusinessDays) {
    out.push({
      id: 'stop-status',
      kind: 'no_status_change',
      label: '状態更新がなく、進捗の共有が読み取りにくい',
      daysSilent: signals.businessDaysSinceStatusChange,
    });
  }
  if (signals.businessDaysSinceAssigneeChange >= staleBusinessDays) {
    out.push({
      id: 'stop-assignee',
      kind: 'no_assignee_change',
      label: '担当の更新がなく、ボールの所在が曖昧になりうる',
      daysSilent: signals.businessDaysSinceAssigneeChange,
    });
  }
  if (!signals.hasDocumentedNextAction) {
    out.push({
      id: 'stop-next',
      kind: 'next_action_unclear',
      label: '次に誰が何をするかが明記されていない',
    });
  }
  return out;
}

export function resolveNextActionClarity(signals: ProjectSignals): NextActionClarity {
  if (!signals.hasDocumentedNextAction) return 'unclear';
  if (signals.businessDaysSinceIssueUpdate < staleBusinessDays) return 'clear';
  return 'partial';
}

export function resolveProceedSafety(
  shareStatus: ShareStatus,
  clarity: NextActionClarity,
): ProceedSafety {
  if (shareStatus === 'attention' || clarity === 'unclear') return 'hold';
  if (shareStatus === 'caution' || clarity === 'partial') return 'careful';
  return 'safe';
}

export function buildSharingObservation(
  shareStatus: ShareStatus,
  reasons: StatusReason[],
): string {
  const primary = reasons.find((r) => r.contributesTo === shareStatus);
  if (primary) return primary.label;
  if (shareStatus === 'stable') return '進行状態を把握できている';
  return '観測中';
}

export function computeCognitiveLoad(load: {
  needsConfirmationCount: number;
  needsReviewCount: number;
  attentionIssueCount: number;
}): CognitiveLoadLevel {
  const total =
    load.needsConfirmationCount + load.needsReviewCount + load.attentionIssueCount;
  if (total >= OBSERVATION_CONFIG.loadHighThreshold) return 'high';
  if (total >= OBSERVATION_CONFIG.loadElevatedThreshold) return 'elevated';
  if (total >= 2) return 'moderate';
  return 'light';
}

export function enrichAssigneeLoads(loads: AssigneeLoad[]): AssigneeLoad[] {
  return loads.map((l) => ({
    ...l,
    cognitiveLoad: computeCognitiveLoad(l),
  }));
}

export function sortByShareStatus<T extends { shareStatus: ShareStatus }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => STATUS_RANK[a.shareStatus] - STATUS_RANK[b.shareStatus],
  );
}

export function buildDirectorPrompts(
  prompts: Omit<DirectorPrompt, 'id'>[],
): DirectorPrompt[] {
  return prompts.map((p, i) => ({ ...p, id: `prompt-${i}` }));
}

export function countAttentionIssues(signals: ProjectSignals): number {
  return (
    signals.unfixedIssueCount +
    signals.provisionalIssueCount +
    signals.requirementsUnsetCount +
    signals.specUndecidedCount
  );
}
