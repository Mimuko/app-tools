import { SHARE_STATUS_CONFIG } from './constants';
import { Panel } from './Panel';
import { ACTION_LABELS, ACTION_TAG_CLASS } from '../lib/labels';
import type { ObservedIssue } from '../types';

interface ObservedIssuesPanelProps {
  issues: ObservedIssue[];
}

export function ObservedIssuesPanel({ issues }: ObservedIssuesPanelProps) {
  return (
    <Panel title="観測された課題" hint="危険状態＋コメント記法。未対応の新規課題は要注目に含めません">
      {issues.length === 0 ? (
        <p className="text-base obs-text-muted">要約すべき課題シグナルはありません。</p>
      ) : (
        <ul className="space-y-3">
          {issues.map((issue) => {
            const st = SHARE_STATUS_CONFIG[issue.shareStatus];
            return (
              <li
                key={issue.id}
                className={`obs-surface-muted rounded-lg border p-4 ${st.borderClass}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${st.dotClass}`} />
                  <span className="text-sm obs-heading-muted">{issue.issueKey}</span>
                  <span className="text-sm obs-text-muted">{st.label}</span>
                </div>
                <p className="mt-2 text-base font-medium obs-text-primary">{issue.title}</p>
                <p className="mt-1 text-sm obs-text-muted">{issue.reasons.join(' · ')}</p>
                {issue.nextActionText && (
                  <p className="mt-2 obs-body-sm text-emerald-700 dark:text-emerald-300/90">
                    {ACTION_LABELS.nextAction}: {issue.nextActionText}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  {issue.needsConfirmation && (
                    <span className={ACTION_TAG_CLASS.needsConfirmation}>
                      {ACTION_LABELS.needsConfirmation}
                    </span>
                  )}
                  {issue.externalWait && (
                    <span className={ACTION_TAG_CLASS.externalWait}>
                      {ACTION_LABELS.externalWait}
                    </span>
                  )}
                  {issue.internalWait && (
                    <span className={ACTION_TAG_CLASS.internalWait}>
                      {ACTION_LABELS.internalWait}
                    </span>
                  )}
                  {issue.hasNextAction && (
                    <span className={ACTION_TAG_CLASS.nextAction}>{ACTION_LABELS.nextAction}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
