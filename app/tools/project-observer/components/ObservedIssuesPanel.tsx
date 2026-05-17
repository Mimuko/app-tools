import { SHARE_STATUS_CONFIG } from './constants';
import { Panel } from './Panel';
import { ACTION_LABELS } from '../lib/labels';
import type { ObservedIssue } from '../types';

interface ObservedIssuesPanelProps {
  issues: ObservedIssue[];
}

export function ObservedIssuesPanel({ issues }: ObservedIssuesPanelProps) {
  return (
    <Panel title="観測された課題" hint="未対応の新規課題は要注目に含めません">
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
                {issue.nextActionText != null && (
                  <p
                    className={`mt-2 text-sm ${
                      issue.nextActionValid ? 'text-emerald-500/90' : 'text-amber-400/90'
                    }`}
                  >
                    次アクション: 「{issue.nextActionText}」
                    {issue.nextActionValid ? ' ✓' : ' — 主体+行動が不足'}
                  </p>
                )}
                <div className="mt-2 flex gap-3 text-sm uppercase tracking-wider obs-text-faint">
                  {issue.awaitingConfirmation && (
                    <span>{ACTION_LABELS.needsConfirmation}</span>
                  )}
                  {issue.unreplied && <span>{ACTION_LABELS.awaitingReply}</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
