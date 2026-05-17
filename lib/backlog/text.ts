/** Backlog コメント・説明の簡易プレーンテキスト化 */
export function stripBacklogMarkup(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractLatestMeaningfulLine(text: string): string {
  const lines = text
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('@') && !l.startsWith('>'));

  return lines[0] ?? text.slice(0, 120);
}
