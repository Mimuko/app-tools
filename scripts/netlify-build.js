/**
 * Netlify 共通ビルド（netlify.toml から呼ぶ）
 * TENANT_ID=crh のときだけ observer:sync を実行する
 */
const { execSync } = require('child_process');

const tenantId = (process.env.TENANT_ID || 'crh').trim();

if (tenantId === 'crh') {
  console.log('[netlify-build] TENANT_ID=crh → running observer:sync');
  execSync('npm run observer:sync', { stdio: 'inherit' });
} else {
  console.log(`[netlify-build] TENANT_ID=${tenantId} → skip observer:sync`);
}

execSync('npm run build', { stdio: 'inherit' });
