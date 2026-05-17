/**
 * Backlog → スナップショット JSON（静的ビルド / Netlify 用）
 * Usage: npx tsx scripts/sync-project-observer.ts
 * Requires .env.local with BACKLOG_* variables
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';

function loadEnvLocal(): void {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

async function main() {
  const { syncProjectFromBacklog } = await import('../lib/backlog/sync-project');
  const { getBacklogProjectKeys, isBacklogConfigured } = await import('../lib/backlog/env');

  if (!isBacklogConfigured()) {
    console.error('BACKLOG_* env vars are not configured in .env.local');
    process.exit(1);
  }

  const observedAt = new Date();
  const keys = getBacklogProjectKeys();
  const records = [];

  for (const key of keys) {
    console.log(`Syncing ${key}...`);
    records.push(await syncProjectFromBacklog(key, observedAt));
  }

  const outDir = path.join(process.cwd(), 'app/tools/project-observer/data');
  mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'snapshot.json');
  writeFileSync(
    outPath,
    JSON.stringify({ observedAt: observedAt.toISOString(), records }, null, 2),
    'utf8',
  );
  console.log(`Wrote ${outPath} (${records.length} projects)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
