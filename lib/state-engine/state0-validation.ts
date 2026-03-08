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
  consultation_type: '今回の相談はどれに近いですか？',
  ask_type: '今欲しい対応',
  request_intent: '今回、どんな変更・対応をしたいですか？',
  target_url: '対象URL/画面',
  current_behavior: '今、どんな状態ですか？',
  expected_behavior: 'どうなってほしいですか？（理想の状態）',
  repro_steps: '何をしたらその状態になりますか？（操作手順）',
  repro_env: 'どの環境で確認しましたか？',
};

export function validateState0(v: State0Values): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  if (isEmpty(v.consultation_type)) {
    missing.push(FIELD_LABELS.consultation_type ?? '相談タイプ');
  }
  if (isEmpty(v.ask_type)) {
    missing.push(FIELD_LABELS.ask_type ?? '今欲しい対応');
  }
  if (isEmpty(v.request_intent) && v.consultation_type !== 'spec_check') {
    missing.push(FIELD_LABELS.request_intent ?? '今回の変更・対応内容');
  }
  if (isEmpty(v.target_url)) {
    missing.push(FIELD_LABELS.target_url ?? '対象URL/画面');
  }
  if (isEmpty(v.current_behavior)) {
    missing.push(FIELD_LABELS.current_behavior ?? '現在の挙動');
  }
  if (isEmpty(v.expected_behavior)) {
    missing.push(FIELD_LABELS.expected_behavior ?? '期待する挙動');
  }
  const isChangeConsultFixOrEstimate =
    v.consultation_type === 'change_consult' &&
    (v.ask_type === 'fix_request' || v.ask_type === 'estimate_fix');
  if (!isChangeConsultFixOrEstimate && isEmpty(v.repro_steps)) {
    missing.push(FIELD_LABELS.repro_steps ?? '再現手順');
  }
  if (!isChangeConsultFixOrEstimate && isEmpty(v.repro_env)) {
    missing.push(FIELD_LABELS.repro_env ?? '再現環境');
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}
