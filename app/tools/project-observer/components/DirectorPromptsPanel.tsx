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
        <p className="text-sm text-slate-500">優先して確認すべき論点はありません。</p>
      ) : (
        <ol className="space-y-3">
          {sorted.map((p) => (
            <li
              key={p.id}
              className={`rounded-md border px-4 py-3 ${
                p.priority === 'high'
                  ? 'border-rose-500/30 bg-rose-950/20'
                  : 'border-slate-700/40 bg-[#0d131c]'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2 text-[10px]">
                <span
                  className={`font-mono uppercase tracking-wider ${
                    p.priority === 'high' ? 'text-rose-400' : 'text-slate-500'
                  }`}
                >
                  {p.priority === 'high' ? '優先' : '確認'}
                </span>
                <span className="text-slate-600">{SOURCE_LABEL[p.source]}</span>
                <span className="text-cyan-600/70">{p.issueKey}</span>
              </div>
              <p className="mt-2 text-sm text-slate-200">{p.summary}</p>
              <p className="mt-1 text-xs text-slate-500">→ {p.forDirector}</p>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
