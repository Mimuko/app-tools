/**
 * 状態分岐エンジン用型定義（CSV Single Source of Truth）
 */

export type InputType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'url' | 'date' | 'output' | 'checkbox_multiple';

export interface OptionItem {
  value: string;
  label: string;
}

export interface FieldDef {
  field_id: string;
  label: string;
  input_type: InputType;
  options: OptionItem[];
  required: boolean;
  help_text: string;
  output_key: string;
  notes: string;
}

export interface FieldSetRow {
  set_id: string;
  state: string;
  field_id: string;
  order: number;
  required_override: boolean | null;
  notes: string;
}

export interface RuleDef {
  rule_id: string;
  priority: number;
  condition_expr: string;
  route: 'STOP' | 'STATE1' | 'STATE2' | 'RETURN';
  show_field_set: string;
  next_action_label: string;
  notes: string;
}

export interface EngineConfig {
  fieldsById: Record<string, FieldDef>;
  fieldSetsBySetId: Record<string, FieldSetRow[]>;
  rules: RuleDef[];
}

/** STATE0で使うフィールドID（依頼整理） */
export const STATE0_FIELD_IDS = [
  'request_intent',
  'origin',
  'target_url',
  'device',
  'phenomenon_note',
  'ask_type',
  'deadline',
  'attachments',
] as const;

/** ルート判定結果 */
export interface RouteResult {
  route: 'STOP' | 'STATE1' | 'STATE2';
  show_field_set: string;
  next_action_label: string;
  rule_id: string;
}

/** STATE0の入力値（フォーム値） */
export interface State0Values {
  request_intent: string;
  origin: string;
  target_url: string;
  device: string;
  phenomenon: string[];
  phenomenon_note: string;
  compare: string[];
  compare_when: string;
  compare_url: string;
  ask_type: string[];
  deadline: string;
  attachments: string;
}
