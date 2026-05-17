import { formatDateTime } from '../lib/format';
import { SIGNAL_LABELS } from './constants';
import { Panel } from './Panel';
import type { ConcernComment } from '../types';

interface ConcernCommentsPanelProps {
  comments: ConcernComment[];
}

const SIGNAL_STYLES: Record<ConcernComment['signal'], string> = {
  provisional: 'text-violet-400 border-violet-500/30',
  unfixed: 'text-amber-400 border-amber-500/30',
  ops: 'text-rose-300 border-rose-500/30',
  pending_reply: 'text-cyan-400 border-cyan-500/30',
};

export function ConcernCommentsPanel({ comments }: ConcernCommentsPanelProps) {
  return (
    <Panel title="懸念のあるコメント" hint="Backlog上の発言から拾ったシグナル">
      {comments.length === 0 ? (
        <p className="text-base text-slate-500">直近の懸念コメントはありません。</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-md border border-slate-700/50 bg-[#0d131c] px-4 py-3"
            >
              <blockquote className="border-l-2 border-cyan-700/50 pl-3 text-base leading-relaxed text-slate-300">
                「{comment.excerpt}」
              </blockquote>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span
                  className={`rounded border px-2 py-0.5 font-mono uppercase tracking-wider ${SIGNAL_STYLES[comment.signal]}`}
                >
                  {SIGNAL_LABELS[comment.signal]}
                </span>
                <span>{comment.issueKey}</span>
                <span>·</span>
                <span>{comment.author}</span>
                <span>·</span>
                <span className="font-mono">{formatDateTime(comment.postedAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
