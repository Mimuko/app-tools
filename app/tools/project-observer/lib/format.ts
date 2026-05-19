import { OBSERVATION_CONFIG } from './observation/config';

const DISPLAY_TIME_ZONE = OBSERVATION_CONFIG.batchTimezone;

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return '1時間以内';
  if (diffHours < 24) return `${diffHours}時間前`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}日前`;
  return date.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
    timeZone: DISPLAY_TIME_ZONE,
  });
}

/** ISO 時刻を観測バッチ基準 TZ（Asia/Tokyo）で表示 */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ja-JP', {
    timeZone: DISPLAY_TIME_ZONE,
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
