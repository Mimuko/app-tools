/**
 * 静的デプロイ用: docs/state-engine の CSV から engine-config.json を生成し out に出力する。
 * next build の後に実行すること（out ディレクトリが存在すること）。
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { loadEngineConfigFromDocs } from '../lib/state-engine/csv-sources';

const OUT_DIR = join(process.cwd(), 'out');
const ENCODING = 'utf-8';

function main() {
  const config = loadEngineConfigFromDocs();
  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }
  const outPath = join(OUT_DIR, 'engine-config.json');
  writeFileSync(outPath, JSON.stringify(config), ENCODING);
  console.log('Wrote', outPath);
}

main();
