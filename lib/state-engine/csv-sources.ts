import { readFileSync } from 'fs';
import { join } from 'path';
import { buildEngineConfig } from './csv-parser';
import type { EngineConfig } from './types';

/** 状態分岐エンジンの CSV 定義（Single Source of Truth） */
export const STATE_ENGINE_DOCS_DIR = join(process.cwd(), 'docs', 'state-engine');

export const STATE_ENGINE_CSV_FILES = {
  master: 'master-fields.csv',
  fieldSets: 'field-sets.csv',
  rules: 'rules.csv',
  optionsByConsultation: 'field-options-by-consultation.csv',
} as const;

export function loadEngineConfigFromDocs(): EngineConfig {
  const read = (filename: string) =>
    readFileSync(join(STATE_ENGINE_DOCS_DIR, filename), 'utf-8');

  const masterFieldsCsv = read(STATE_ENGINE_CSV_FILES.master);
  const fieldSetsCsv = read(STATE_ENGINE_CSV_FILES.fieldSets);
  const rulesCsv = read(STATE_ENGINE_CSV_FILES.rules);

  let optionsByConsultationCsv: string | undefined;
  try {
    optionsByConsultationCsv = read(STATE_ENGINE_CSV_FILES.optionsByConsultation);
  } catch {
    optionsByConsultationCsv = undefined;
  }

  return buildEngineConfig(
    masterFieldsCsv,
    fieldSetsCsv,
    rulesCsv,
    optionsByConsultationCsv
  );
}
