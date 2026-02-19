/**
 * STATE0送信時のバリデーション
 * - target_url 必須
 * - request_intent（依頼の種類）必須
 */

import type { State0Values } from './types';

export interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

function isEmpty(s: string | undefined): boolean {
  return s === undefined || String(s).trim() === '';
}

/** 表示用ラベル（MASTER_FIELDS の label に合わせる） */
const FIELD_LABELS: Record<string, string> = {
  target_url: '対象URL/画面',
  request_intent: '今回、どんな変更・対応をしたいですか？',
};

export function validateState0(v: State0Values): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  if (isEmpty(v.target_url)) {
    missing.push(FIELD_LABELS.target_url ?? '対象URL/画面');
  }
  if (isEmpty(v.request_intent)) {
    missing.push(FIELD_LABELS.request_intent ?? '依頼の種類');
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}
