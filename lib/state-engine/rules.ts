/**
 * RULES評価器：STATE0入力から route と show_field_set を決定
 * rule_id ごとに predicate を用意（安全で壊れにくい）
 */

import type { RuleDef } from './types';
import type { State0Values } from './types';

export type RouteResult = {
  route: 'STOP' | 'STATE1' | 'STATE2';
  show_field_set: string;
  next_action_label: string;
  rule_id: string;
};

function isEmpty(s: string | undefined): boolean {
  return s === undefined || String(s).trim() === '';
}

function hasRequestIntent(v: State0Values, value: string): boolean {
  return String(v.request_intent ?? '').trim() === value;
}

function hasRequestIntentAny(v: State0Values, values: string[]): boolean {
  const intent = String(v.request_intent ?? '').trim();
  return values.includes(intent);
}

const predicates: Record<string, (v: State0Values) => boolean> = {
  R_STOP_NO_URL: (v) => isEmpty(v.target_url),
  R_STOP_NO_INTENT: (v) => isEmpty(v.request_intent),
  R_S2_DISPLAY_CHANGE: (v) => hasRequestIntent(v, 'display_change'),
  R_S1_INTENT: (v) =>
    hasRequestIntentAny(v, ['feature_change', 'bug_fix', 'revert_spec', 'need_consult']),
  R_DEFAULT_S1: () => true,
};

/**
 * STATE0の値を評価し、最初に一致したルールの route / show_field_set を返す
 * STOP / STATE1 / STATE2 のみ返す（RETURN はスキップ）
 */
export function evaluateRules(
  rules: RuleDef[],
  state0: State0Values
): RouteResult | null {
  for (const rule of rules) {
    if (rule.route === 'RETURN') continue;
    const pred = predicates[rule.rule_id];
    if (!pred) continue;
    if (pred(state0)) {
      return {
        route: rule.route as 'STOP' | 'STATE1' | 'STATE2',
        show_field_set: rule.show_field_set,
        next_action_label: rule.next_action_label,
        rule_id: rule.rule_id,
      };
    }
  }
  return null;
}
