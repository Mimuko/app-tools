import type { DirectorPrompt } from '../types';

const SOURCE_LABEL: Record<DirectorPrompt['source'], string> = {
  status_change: 'ステータス変更',
  assignee_change: '担当変更',
  comment_signal: 'コメント',
};

export function DirectorPromptCard({ prompt: p }: { prompt: DirectorPrompt }) {
  const issueUrl = p.issueUrl;
  const cardClass = [
    'block rounded-md border px-4 py-3 transition-colors',
    p.priority === 'high'
      ? 'border-rose-500/35 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-950/20'
      : 'obs-prompt-card',
    issueUrl ? 'obs-prompt-card--link' : '',
  ].join(' ');

  const body = (
    <>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span
          className={`uppercase tracking-wider ${
            p.priority === 'high' ? 'text-rose-700 dark:text-rose-400' : 'obs-text-muted'
          }`}
        >
          {p.priority === 'high' ? '優先' : '確認'}
        </span>
        <span className="obs-text-faint">{SOURCE_LABEL[p.source]}</span>
        <span className={`${issueUrl ? 'obs-accent' : 'obs-heading-muted'}`}>
          {p.issueKey}
          {issueUrl && (
            <span className="ml-1.5 obs-text-faint" aria-hidden>
              ↗
            </span>
          )}
        </span>
      </div>
      <p className="mt-2 text-base obs-text-primary">{p.summary}</p>
      {p.forDirector && (
        <p className="mt-1 text-sm obs-text-muted">担当: {p.forDirector}</p>
      )}
    </>
  );

  if (!issueUrl) {
    return <div className={cardClass}>{body}</div>;
  }

  return (
    <a
      href={issueUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cardClass}
      aria-label={`Backlogで課題 ${p.issueKey} を開く: ${p.summary}`}
    >
      {body}
    </a>
  );
}
