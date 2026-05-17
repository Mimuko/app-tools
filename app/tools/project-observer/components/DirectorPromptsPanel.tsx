import { Panel } from './Panel';
import type { DirectorPrompt } from '../types';

const SOURCE_LABEL: Record<DirectorPrompt['source'], string> = {
  status_change: 'ステータス変更',
  assignee_change: '担当変更',
  comment_signal: 'コメント',
};

interface DirectorPromptsPanelProps {
  prompts: DirectorPrompt[];
  title?: string;
}

function PromptCard({ prompt: p }: { prompt: DirectorPrompt }) {
  const issueUrl = p.issueUrl;
  const cardClass = `block rounded-md border px-4 py-3 transition-colors ${
    p.priority === 'high'
      ? 'border-rose-500/30 bg-rose-950/20'
      : 'border-slate-700/40 bg-[#0d131c]'
  } ${
    issueUrl
      ? 'hover:border-cyan-500/40 hover:bg-[#101820] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500/60'
      : ''
  }`;

  const body = (
    <>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span
          className={`font-mono uppercase tracking-wider ${
            p.priority === 'high' ? 'text-rose-400' : 'text-slate-500'
          }`}
        >
          {p.priority === 'high' ? '優先' : '確認'}
        </span>
        <span className="text-slate-600">{SOURCE_LABEL[p.source]}</span>
        <span className={`font-mono ${issueUrl ? 'text-cyan-400' : 'text-cyan-600/70'}`}>
          {p.issueKey}
          {issueUrl && (
            <span className="ml-1.5 text-slate-500" aria-hidden>
              ↗
            </span>
          )}
        </span>
      </div>
      <p className="mt-2 text-base text-slate-200">{p.summary}</p>
      {p.forDirector && (
        <p className="mt-1 text-sm text-slate-500">担当: {p.forDirector}</p>
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

export function DirectorPromptsPanel({
  prompts,
  title = 'ディレクターへの確認促し',
}: DirectorPromptsPanelProps) {
  const sorted = [...prompts].sort((a, b) =>
    a.priority === b.priority ? 0 : a.priority === 'high' ? -1 : 1,
  );

  return (
    <Panel title={title} hint="副目的: 次に何を確認・優先すべきか（PoCはルールベース）">
      {sorted.length === 0 ? (
        <p className="text-base text-slate-500">優先して確認すべき論点はありません。</p>
      ) : (
        <ol className="space-y-3">
          {sorted.map((p) => (
            <li key={p.id}>
              <PromptCard prompt={p} />
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
