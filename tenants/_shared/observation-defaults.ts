/**
 * テナント共通の観測ルール（閾値・キーワード等）。
 * テナントごとに上書きする項目は各 tenants 配下の config.ts で指定する。
 */
export const SHARED_OBSERVATION_DEFAULTS = {
  staleBusinessDays: 3,
  commentParseLimit: 10,
  batchScheduleLabel: '毎日 6:00',
  batchTimezone: 'Asia/Tokyo',
  loadElevatedThreshold: 4,
  loadHighThreshold: 7,
  attentionCommentPatterns: [
    /未FIX|未fix|まだFIX/i,
    /暫定|一旦対応|仮対応/i,
    /要件未確定|仕様未決|仕様未確定/i,
  ] as readonly RegExp[],
  nextActionNgPatterns: [
    /^確認します/,
    /^一旦対応/,
    /^調整中/,
    /^検討中/,
    /^対応します$/,
  ] as readonly RegExp[],
  nextActionOkExamples: [
    'クライアント確認待ち',
    'デザイン修正対応',
    '実装調査予定',
  ],
} as const;
