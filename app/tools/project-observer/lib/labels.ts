/** 一覧セクション見出し */
export const SECTION_HEADINGS = {
  /** 担当者（ディレクター）に割り当てられた課題を、担当者別に表示 */
  directorAssignedIssues: '担当者別の割り当て課題',
} as const;

/** プロジェクト全体計測（ProjectCard） */
export const METRIC_LABELS = {
  statusUnrecorded: '状態未記載',
} as const;

/** 朝会UI — コメント記法・要整理に対応する表示ラベル */
export const ACTION_LABELS = {
  needsConfirmation: '要確認',
  externalWait: '外部待ち',
  internalWait: '社内待ち',
  nextAction: '次アクション',
  needsOrganization: '要整理課題',
} as const;

export const NOTATION_PREFIX_HINTS = {
  needsConfirmation: '要確認：',
  externalWait: '外部待ち：',
  internalWait: '社内待ち：',
  nextAction: '次アクション：',
} as const;

export const ACTION_LABEL_HINTS = {
  needsConfirmation:
    'コメントに「要確認：」と書かれた課題。ディレクター判断・要件確認が必要です。',
  externalWait:
    'コメントに「外部待ち：」と書かれた課題。クライアント・発注など社外依存の待機です。',
  internalWait:
    'コメントに「社内待ち：」と書かれた課題。デザイン・実装などチーム内の待機です。',
  nextAction:
    'コメントに「次アクション：」と書かれた課題。次に誰が何をするか整理済みです。',
  needsOrganization:
    'コメントに記法（要確認・待ち・次アクション）が未記載の課題。朝会前にいずれかを書いて整理してください。',
} as const;

export const METRIC_LABEL_HINTS = {
  statusUnrecorded:
    'ディレクター担当の観測対象課題のうち、コメントに正式記法が1つもない件数です。',
} as const;

export const ACTION_TAG_CLASS = {
  needsConfirmation: 'obs-tag obs-tag--confirm',
  externalWait: 'obs-tag obs-tag--external',
  internalWait: 'obs-tag obs-tag--internal',
  nextAction: 'obs-tag obs-tag--next',
  needsOrganization: 'obs-tag obs-tag--organization',
} as const;
