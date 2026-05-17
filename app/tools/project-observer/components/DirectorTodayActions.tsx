import { ACTION_LABELS } from '../lib/labels';
import type { FleetDirectorAction } from '../types';

interface DirectorTodayActionsProps {
  actions: FleetDirectorAction[];
}

export function DirectorTodayActions({ actions }: DirectorTodayActionsProps) {
  if (actions.length === 0) {
    return (
      <section className="obs-section-secondary">
        <header className="mb-4">
          <h2 className="obs-heading">今日の確認アクション</h2>
          <p className="mt-1 text-sm obs-text-muted">
            ディレクターごと — 要確認・返信待ちの課題
          </p>
        </header>
        <p className="obs-surface-muted rounded-lg px-5 py-8 text-center text-base obs-text-muted">
          いま担当者に割り当てられた確認アクションはありません。
        </p>
      </section>
    );
  }

  return (
    <section className="obs-section-secondary" aria-label="今日の確認アクション">
      <header className="mb-4">
        <h2 className="obs-heading">今日の確認アクション</h2>
        <p className="mt-1 text-sm obs-text-muted">
          朝会後、各ディレクターが今日見るべき課題（要確認 = 判断が必要 / 返信待ち = 外部返信待ち）
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {actions.map((director) => (
          <DirectorCard key={director.assigneeId} director={director} />
        ))}
      </div>
    </section>
  );
}

function DirectorCard({ director }: { director: FleetDirectorAction }) {
  return (
    <article className="obs-surface rounded-lg px-5 py-4">
      <h3 className="text-lg font-semibold obs-text-primary">{director.name}</h3>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm tabular-nums">
        <span className="text-cyan-700 dark:text-cyan-300/90">
          {ACTION_LABELS.needsConfirmation} {director.needsConfirmationCount}
        </span>
        <span className="text-amber-700 dark:text-amber-300/80">
          {ACTION_LABELS.awaitingReply} {director.awaitingReplyCount}
        </span>
      </div>

      <ul className="obs-divider mt-4 space-y-2 border-t pt-3">
        {director.issues.map((issue) => (
          <li key={issue.issueKey}>
            <IssueRow issue={issue} />
          </li>
        ))}
      </ul>
    </article>
  );
}

function IssueRow({ issue }: { issue: FleetDirectorAction['issues'][number] }) {
  const label = issue.issueKey;
  const content = (
    <>
      <span className="obs-heading-muted">{label}</span>
      <span className="mt-0.5 block text-sm leading-snug obs-text-muted line-clamp-2">
        {issue.title}
      </span>
      <span className="mt-1 flex flex-wrap gap-2">
        {issue.needsConfirmation && (
          <IssueTag tone="confirm">{ACTION_LABELS.needsConfirmation}</IssueTag>
        )}
        {issue.awaitingReply && (
          <IssueTag tone="reply">{ACTION_LABELS.awaitingReply}</IssueTag>
        )}
      </span>
    </>
  );

  if (issue.issueUrl) {
    return (
      <a
        href={issue.issueUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="obs-prompt-card--link block rounded-md border border-transparent px-2 py-1.5 transition-colors hover:border-[var(--obs-border-subtle)] hover:bg-[var(--obs-prompt-hover)]"
      >
        {content}
      </a>
    );
  }

  return <div className="px-2 py-1.5">{content}</div>;
}

function IssueTag({
  children,
  tone,
}: {
  children: string;
  tone: 'confirm' | 'reply';
}) {
  const className =
    tone === 'confirm'
      ? 'rounded border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 text-xs text-cyan-800 dark:text-cyan-200/90'
      : 'rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-xs text-amber-800 dark:text-amber-200/90';

  return <span className={className}>{children}</span>;
}
