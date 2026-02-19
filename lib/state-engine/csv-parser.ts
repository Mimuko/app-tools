/**
 * 3CSVを読み込み EngineConfig に変換する
 * MASTER_FIELDS / FIELD_SETS / RULES
 */

import { parseCsv } from './parse-csv';
import type {
  EngineConfig,
  FieldDef,
  FieldSetRow,
  RuleDef,
  InputType,
  OptionItem,
} from './types';

function normalizeBoolean(v: string): boolean {
  if (v === undefined || v === null) return false;
  const s = String(v).trim().toUpperCase();
  return s === 'TRUE' || s === '1' || s === 'YES' || s === 'ON';
}

function parseOptions(optionsStr: string): OptionItem[] {
  if (!optionsStr || !optionsStr.trim()) return [];
  const lines = optionsStr.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  const result: OptionItem[] = [];
  for (const line of lines) {
    const pipe = line.indexOf('|');
    if (pipe >= 0) {
      result.push({
        value: line.slice(0, pipe).trim(),
        label: line.slice(pipe + 1).trim(),
      });
    } else if (line) {
      result.push({ value: line, label: line });
    }
  }
  return result;
}

function get(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null) return v;
  }
  return '';
}

/** MASTER_FIELDS.csv の1行を FieldDef に */
function parseMasterFieldsRow(row: Record<string, string>): FieldDef | null {
  const field_id = get(row, 'field_id').trim();
  if (!field_id) return null;
  const label = get(row, 'label');
  const input_type = (get(row, 'input_type') || 'text').trim() as InputType;
  const optionsRaw = get(row, 'options (value|label per line)');
  const options = parseOptions(optionsRaw);
  const requiredStr = get(row, 'required (true/false)');
  const required = normalizeBoolean(requiredStr);
  const help_text = get(row, 'help_text');
  const output_key = get(row, 'output_key');
  const notes = get(row, 'notes');
  return {
    field_id,
    label: label.trim(),
    input_type,
    options,
    required,
    help_text: help_text.trim(),
    output_key: output_key.trim(),
    notes: notes.trim(),
  };
}

/** FIELD_SETS.csv の1行を FieldSetRow に */
function parseFieldSetsRow(row: Record<string, string>): FieldSetRow {
  const requiredOverrideStr = get(row, 'required_override').trim().toUpperCase();
  let required_override: boolean | null = null;
  if (requiredOverrideStr === 'TRUE' || requiredOverrideStr === '1') required_override = true;
  else if (requiredOverrideStr === 'FALSE' || requiredOverrideStr === '0') required_override = false;

  return {
    set_id: get(row, 'set_id').trim(),
    state: get(row, 'state').trim(),
    field_id: get(row, 'field_id').trim(),
    order: parseInt(get(row, 'order') || '0', 10) || 0,
    required_override,
    notes: get(row, 'notes').trim(),
  };
}

/** RULES.csv の1行を RuleDef に */
function parseRulesRow(row: Record<string, string>): RuleDef | null {
  const rule_id = get(row, 'rule_id').trim();
  if (!rule_id) return null;
  const priority = parseInt(get(row, 'priority') || '99', 10) || 99;
  const condition_expr = get(row, 'condition_expr (human readable)').trim();
  const route = (get(row, 'route') || 'STATE1').trim() as RuleDef['route'];
  const show_field_set = get(row, 'show_field_set').trim();
  const next_action_label = get(row, 'next_action_label').trim();
  const notes = get(row, 'notes').trim();
  return {
    rule_id,
    priority,
    condition_expr,
    route,
    show_field_set,
    next_action_label,
    notes,
  };
}

function csvToObjectsGeneric(content: string): Record<string, string>[] {
  const { headers, rows } = parseCsv(content);
  return rows.map((cells) => {
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      const key = h.trim();
      row[key] = cells[idx] ?? '';
    });
    return row;
  });
}

function stripBom(s: string): string {
  if (!s || s.length === 0) return s;
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

/**
 * 3つのCSV文字列から EngineConfig を生成
 */
export function buildEngineConfig(
  masterFieldsCsv: string,
  fieldSetsCsv: string,
  rulesCsv: string
): EngineConfig {
  const fieldsById: Record<string, FieldDef> = {};
  const masterRows = csvToObjectsGeneric(stripBom(masterFieldsCsv));
  for (const row of masterRows) {
    const def = parseMasterFieldsRow(row);
    if (def) fieldsById[def.field_id] = def;
  }

  const fieldSetsBySetId: Record<string, FieldSetRow[]> = {};
  const setRows = csvToObjectsGeneric(stripBom(fieldSetsCsv));
  for (const row of setRows) {
    const r = parseFieldSetsRow(row);
    if (!r.set_id) continue;
    if (!fieldSetsBySetId[r.set_id]) fieldSetsBySetId[r.set_id] = [];
    fieldSetsBySetId[r.set_id].push(r);
  }
  for (const setId of Object.keys(fieldSetsBySetId)) {
    fieldSetsBySetId[setId].sort((a, b) => a.order - b.order);
  }

  const rules: RuleDef[] = [];
  const ruleRows = csvToObjectsGeneric(stripBom(rulesCsv));
  for (const row of ruleRows) {
    const r = parseRulesRow(row);
    if (r) rules.push(r);
  }
  rules.sort((a, b) => a.priority - b.priority);

  return {
    fieldsById,
    fieldSetsBySetId,
    rules,
  };
}
