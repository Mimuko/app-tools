export function getBacklogSpaceOrigin(): string {
  const space = process.env.BACKLOG_SPACE?.trim();
  if (!space) return '';
  const base = space.startsWith('http') ? space : `https://${space}.backlog.jp`;
  return base.replace(/\/$/, '');
}

export function getBacklogApiBase(): string {
  const origin = getBacklogSpaceOrigin();
  return origin ? `${origin}/api/v2` : '';
}

export function getBacklogApiKey(): string {
  return process.env.BACKLOG_API_KEY?.trim() ?? '';
}

export function getBacklogProjectKeys(): string[] {
  const raw = process.env.BACKLOG_PROJECT_IDS?.trim();
  if (!raw) return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

export function getInternalEmailDomain(): string {
  return process.env.BACKLOG_INTERNAL_EMAIL_DOMAIN?.trim() || 'creativehope.jp';
}

export function isBacklogConfigured(): boolean {
  return Boolean(getBacklogApiBase() && getBacklogApiKey() && getBacklogProjectKeys().length > 0);
}

export function shouldUseBacklogMock(): boolean {
  return process.env.BACKLOG_USE_MOCK === 'true' || !isBacklogConfigured();
}
