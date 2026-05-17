/**
 * 朝会支援UI — 観測仕様（Backlog連携前の合意値）
 * Backlogがマスタ。本ツールは認知しやすく整理するレイヤー。
 */
export const OBSERVATION_CONFIG = {
  /** 更新なし: 営業日ベース */
  staleBusinessDays: 3,

  /** コメント解析: 最新N件 + 課題本文 */
  commentParseLimit: 10,

  /** バッチ: 毎日 AM6:00（表示用） */
  batchScheduleLabel: '毎日 6:00',
  batchTimezone: 'Asia/Tokyo',

  /** 負荷しきい値（確認待ち+未返信+要確認） */
  loadElevatedThreshold: 4,
  loadHighThreshold: 7,

  /** 対象 Backlog スペース（表示用） */
  backlogSpaceLabel: '特定Backlogスペース',

  /**
   * 要注目キーワード（単なる未対応は含めない）
   * 最新10件コメント + 課題本文を対象
   */
  attentionCommentPatterns: [
    /未FIX|未fix|まだFIX/i,
    /暫定|一旦対応|仮対応/i,
    /要件未確定|仕様未決|仕様未確定/i,
  ] as readonly RegExp[],

  /** 次アクション NG（主体+行動がない） */
  nextActionNgPatterns: [
    /^確認します/,
    /^一旦対応/,
    /^調整中/,
    /^検討中/,
    /^対応します$/,
  ] as readonly RegExp[],

  /** 次アクション OK の例（主体+行動） */
  nextActionOkExamples: [
    'クライアント確認待ち',
    'デザイン修正対応',
    '実装調査予定',
  ],
} as const;

/** 負荷集計対象: ディレクターチームのみ */
export const DIRECTOR_TEAM: readonly {
  id: string;
  backlogName: string;
}[] = [
  { id: 'nakaya', backlogName: 'CRH_中谷信明' },
  { id: 'nakano', backlogName: 'CRH_中野 絵理子' },
  { id: 'masui', backlogName: 'CRH_増位' },
  { id: 'urabe', backlogName: 'CRH_浦辺良亮' },
  { id: 'kuge', backlogName: '久下 しおり' },
  { id: 'kosugi', backlogName: '小杉 慶来' },
] as const;

export function isDirector(backlogUserName: string): boolean {
  return DIRECTOR_TEAM.some((d) => d.backlogName === backlogUserName);
}

/** 担当者または登録者がディレクターチームの課題か */
export function isDirectorTeamScopedIssue(issue: {
  assignee?: { name: string } | null;
  createdUser: { name: string };
}): boolean {
  const assignee = issue.assignee?.name?.trim();
  if (assignee && isDirector(assignee)) return true;
  const creator = issue.createdUser.name?.trim();
  if (creator && isDirector(creator)) return true;
  return false;
}

/** 観測スコープ内のディレクターが課題担当のときのみ Backlog 表示名を返す */
export function getInScopeAssigneeName(
  backlogAssigneeName: string | null | undefined,
): string | null {
  const name = backlogAssigneeName?.trim();
  if (!name || !isDirector(name)) return null;
  return name;
}
