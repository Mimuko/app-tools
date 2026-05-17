'use client';

import { useEffect, useMemo, useState } from 'react';
import { DirectorPromptCard } from './DirectorPromptCard';
import type { DirectorPrompt } from '../types';

function sortPrompts(prompts: DirectorPrompt[]): DirectorPrompt[] {
  return [...prompts].sort((a, b) =>
    a.priority === b.priority ? 0 : a.priority === 'high' ? -1 : 1,
  );
}

interface DirectorPromptsListProps {
  prompts: DirectorPrompt[];
  /** 指定時は初期表示件数と「もっと見る」の増分 */
  pageSize?: number;
}

export function DirectorPromptsList({ prompts, pageSize }: DirectorPromptsListProps) {
  const sorted = useMemo(() => sortPrompts(prompts), [prompts]);
  const chunk = pageSize ?? sorted.length;
  const [visibleCount, setVisibleCount] = useState(chunk);

  useEffect(() => {
    setVisibleCount(chunk);
  }, [chunk, prompts]);

  const visible = sorted.slice(0, visibleCount);
  const remaining = sorted.length - visibleCount;
  const canExpand = pageSize != null && remaining > 0;
  const canCollapse = pageSize != null && visibleCount > chunk;

  if (sorted.length === 0) {
    return <p className="text-base obs-text-muted">優先して確認すべき論点はありません。</p>;
  }

  return (
    <div>
      <ol className="space-y-3" aria-live="polite">
        {visible.map((p) => (
          <li key={p.id}>
            <DirectorPromptCard prompt={p} />
          </li>
        ))}
      </ol>

      {(canExpand || canCollapse) && (
        <div
          className="obs-divider mt-4 flex flex-col items-center gap-2 border-t pt-4 sm:flex-row sm:justify-center"
          role="group"
          aria-label="一覧の表示件数"
        >
          {canExpand && (
            <button
              type="button"
              className="obs-prompts-more-btn w-full sm:w-auto"
              aria-expanded={visibleCount < sorted.length}
              onClick={() => setVisibleCount((n) => Math.min(n + chunk, sorted.length))}
            >
              もっと見る
              <span className="obs-text-faint">（あと {remaining} 件）</span>
            </button>
          )}
          {canCollapse && (
            <button
              type="button"
              className="obs-prompts-more-btn obs-prompts-more-btn--muted w-full sm:w-auto"
              onClick={() => setVisibleCount(chunk)}
            >
              閉じる
            </button>
          )}
        </div>
      )}

      {pageSize != null && sorted.length > chunk && (
        <p className="mt-2 text-center text-sm obs-text-faint">
          {visible.length} / {sorted.length}
        </p>
      )}
    </div>
  );
}
