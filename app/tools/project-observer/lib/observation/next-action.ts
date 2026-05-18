import { OBSERVATION_CONFIG } from './config';

/** 次アクション: 主体＋行動がコメント等に明記されているか */
export function isNextActionDocumented(text: string | undefined | null): boolean {
  if (!text?.trim()) return false;
  const t = text.trim();
  if (OBSERVATION_CONFIG.nextActionNgPatterns.some((p) => p.test(t))) {
    return false;
  }
  // 短文のみは不明扱い
  if (t.length < 6) return false;
  return true;
}

export function classifyNextActionText(text: string | undefined | null): {
  valid: boolean;
  hint: string;
} {
  if (!text?.trim()) {
    return { valid: false, hint: '次アクションの記載なし' };
  }
  if (!isNextActionDocumented(text)) {
    return {
      valid: false,
      hint: '「確認します」「一旦対応」等 — 主体+行動が不明',
    };
  }
  return { valid: true, hint: '主体+行動が明記されています' };
}
