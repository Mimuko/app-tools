import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { buildEngineConfig } from '@/lib/state-engine/csv-parser';

const DOCS_DIR = join(process.cwd(), 'docs');
const ENCODING = 'utf-8';

const FILES = {
  master: '状態分岐エンジン - MASTER_FIELDS.csv',
  fieldSets: '状態分岐エンジン - FIELD_SETS.csv',
  rules: '状態分岐エンジン - RULES.csv',
} as const;

export async function GET() {
  try {
    const masterFieldsCsv = readFileSync(join(DOCS_DIR, FILES.master), ENCODING);
    const fieldSetsCsv = readFileSync(join(DOCS_DIR, FILES.fieldSets), ENCODING);
    const rulesCsv = readFileSync(join(DOCS_DIR, FILES.rules), ENCODING);
    const config = buildEngineConfig(masterFieldsCsv, fieldSetsCsv, rulesCsv);
    return NextResponse.json(config);
  } catch (e) {
    console.error('engine-config load error', e);
    return NextResponse.json(
      { error: 'Failed to load engine config' },
      { status: 500 }
    );
  }
}
