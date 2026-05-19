import {
  ACTION_LABEL_HINTS,
  ACTION_LABELS,
  ACTION_TAG_CLASS,
  SECTION_HEADINGS,
} from '../lib/labels';
import type { DirectorActionIssue, FleetDirectorAction } from '../types';

interface DirectorTodayActionsProps {
  actions: FleetDirectorAction[];
}

export function DirectorTodayActions({ actions }: DirectorTodayActionsProps) {
  if (actions.length === 0) {
    return (
      <section className="obs-section-secondary">
        <header className="mb-5">
          <h2 className="obs-heading">{SECTION_HEADINGS.directorAssignedIssues}</h2>
          <ActionLabelLegend className="mt-3" />
        </header>
        <p className="obs-surface-muted rounded-lg px-5 py-8 text-center obs-body obs-text-muted">
          ディレクター担当の観測対象課題はありません。
        </p>
      </section>
    );
  }

  return (
    <section className="obs-section-secondary" aria-label={SECTION_HEADINGS.directorAssignedIssues}>
      <header className="mb-5">
        <h2 className="obs-heading">{SECTION_HEADINGS.directorAssignedIssues}</h2>
        <p className="mt-1.5 obs-section-lead">
          Backlog で担当者がディレクターチームの課題一覧。コメント記法があるものと、記法未記載の
          要整理課題を表示します。
        </p>
        <ActionLabelLegend className="mt-3" />
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
      <h3 className="obs-card-title">{director.name}</h3>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 obs-body-sm tabular-nums font-medium">
        {director.needsConfirmationCount > 0 && (
          <span className="text-amber-800 dark:text-amber-200/90">
            {ACTION_LABELS.needsConfirmation} {director.needsConfirmationCount}
          </span>
        )}
        {director.externalWaitCount > 0 && (
          <span className="text-blue-700 dark:text-blue-300/90">
            {ACTION_LABELS.externalWait} {director.externalWaitCount}
          </span>
        )}
        {director.internalWaitCount > 0 && (
          <span className="text-violet-700 dark:text-violet-300/90">
            {ACTION_LABELS.internalWait} {director.internalWaitCount}
          </span>
        )}
        {director.needsOrganizationCount > 0 && (
          <span className="text-slate-700 dark:text-slate-300/90">
            {ACTION_LABELS.needsOrganization} {director.needsOrganizationCount}
          </span>
        )}
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

function IssueRow({ issue }: { issue: DirectorActionIssue }) {
  const content = (
    <>
      <span className="obs-heading-muted">{issue.issueKey}</span>
      <span className="mt-1 block obs-body leading-snug obs-text-primary line-clamp-2">
        {issue.title}
      </span>
      <NotationLines issue={issue} />
      <span className="mt-1.5 flex flex-wrap gap-2">
        {issue.needsOrganization && (
          <IssueTag tone="organization">{ACTION_LABELS.needsOrganization}</IssueTag>
        )}
        {issue.needsConfirmation && (
          <IssueTag tone="confirm">{ACTION_LABELS.needsConfirmation}</IssueTag>
        )}
        {issue.externalWait && (
          <IssueTag tone="external">{ACTION_LABELS.externalWait}</IssueTag>
        )}
        {issue.internalWait && <IssueTag tone="internal">{ACTION_LABELS.internalWait}</IssueTag>}
        {issue.hasNextAction && <IssueTag tone="next">{ACTION_LABELS.nextAction}</IssueTag>}
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

function NotationLines({ issue }: { issue: DirectorActionIssue }) {
  if (issue.needsOrganization) return null;

  const lines: { label: string; text: string | null | undefined }[] = [
    { label: ACTION_LABELS.needsConfirmation, text: issue.needsReviewNote },
    { label: ACTION_LABELS.externalWait, text: issue.waitingExternalNote },
    { label: ACTION_LABELS.internalWait, text: issue.waitingInternalNote },
    { label: ACTION_LABELS.nextAction, text: issue.nextActionNote },
  ].filter((l) => l.text);

  if (lines.length === 0) return null;

  return (
    <ul className="mt-2 space-y-1 obs-body-sm obs-text-muted">
      {lines.map((l) => (
        <li key={l.label}>
          <span className="obs-text-secondary">{l.label}:</span> {l.text}
        </li>
      ))}
    </ul>
  );
}

function ActionLabelLegend({ className = '' }: { className?: string }) {
  return (
    <ul className={`space-y-2 obs-body-sm leading-relaxed obs-text-muted ${className}`}>
      {(Object.keys(ACTION_LABELS) as Array<keyof typeof ACTION_LABELS>).map((key) => (
        <li key={key}>
          <strong className="font-semibold obs-text-secondary">{ACTION_LABELS[key]}</strong>
          {' — '}
          {ACTION_LABEL_HINTS[key]}
        </li>
      ))}
    </ul>
  );
}

function IssueTag({
  children,
  tone,
}: {
  children: string;
  tone: 'confirm' | 'external' | 'internal' | 'next' | 'organization';
}) {
  const className =
    tone === 'confirm'
      ? ACTION_TAG_CLASS.needsConfirmation
      : tone === 'external'
        ? ACTION_TAG_CLASS.externalWait
        : tone === 'internal'
          ? ACTION_TAG_CLASS.internalWait
          : tone === 'organization'
            ? ACTION_TAG_CLASS.needsOrganization
            : ACTION_TAG_CLASS.nextAction;

  return <span className={className}>{children}</span>;
}
