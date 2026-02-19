/**
 * 静的デプロイ用: docs の CSV から engine-config.json を生成し out に出力する。
 * next build の後に実行すること（out ディレクトリが存在すること）。
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { buildEngineConfig } from '../lib/state-engine/csv-parser';

const DOCS_DIR = join(process.cwd(), 'docs');
const OUT_DIR = join(process.cwd(), 'out');
const ENCODING = 'utf-8';

const FILES = {
  master: '状態分岐エンジン - MASTER_FIELDS.csv',
  fieldSets: '状態分岐エンジン - FIELD_SETS.csv',
  rules: '状態分岐エンジン - RULES.csv',
} as const;

function main() {
  const masterFieldsCsv = readFileSync(join(DOCS_DIR, FILES.master), ENCODING);
  const fieldSetsCsv = readFileSync(join(DOCS_DIR, FILES.fieldSets), ENCODING);
  const rulesCsv = readFileSync(join(DOCS_DIR, FILES.rules), ENCODING);
  const config = buildEngineConfig(masterFieldsCsv, fieldSetsCsv, rulesCsv);
  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }
  const outPath = join(OUT_DIR, 'engine-config.json');
  writeFileSync(outPath, JSON.stringify(config), ENCODING);
  console.log('Wrote', outPath);
}

main();
