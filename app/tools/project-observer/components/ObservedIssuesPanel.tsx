import { SHARE_STATUS_CONFIG } from './constants';
import { Panel } from './Panel';
import type { ObservedIssue } from '../types';

interface ObservedIssuesPanelProps {
  issues: ObservedIssue[];
}

export function ObservedIssuesPanel({ issues }: ObservedIssuesPanelProps) {
  return (
    <Panel title="観測された課題" hint="未対応の新規課題は要注目に含めません">
      {issues.length === 0 ? (
        <p className="text-sm text-slate-500">要約すべき課題シグナルはありません。</p>
      ) : (
        <ul className="space-y-3">
          {issues.map((issue) => {
            const st = SHARE_STATUS_CONFIG[issue.shareStatus];
            return (
              <li
                key={issue.id}
                className={`rounded-lg border p-4 ${st.borderClass} bg-[#0c1219]/60`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${st.dotClass}`} />
                  <span className="font-mono text-xs text-cyan-600/80">{issue.issueKey}</span>
                  <span className="text-[10px] text-slate-500">{st.label}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-100">{issue.title}</p>
                <p className="mt-1 text-xs text-slate-500">{issue.reasons.join(' · ')}</p>
                {issue.nextActionText != null && (
                  <p
                    className={`mt-2 text-xs ${
                      issue.nextActionValid ? 'text-emerald-500/90' : 'text-amber-400/90'
                    }`}
                  >
                    次アクション: 「{issue.nextActionText}」
                    {issue.nextActionValid ? ' ✓' : ' — 主体+行動が不足'}
                  </p>
                )}
                <div className="mt-2 flex gap-3 text-[10px] uppercase tracking-wider text-slate-600">
                  {issue.awaitingConfirmation && <span>要確認</span>}
                  {issue.unreplied && <span>未返信（社内最終）</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
