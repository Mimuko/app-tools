import { CONTEXT_NOTE_CATEGORY } from './constants';
import { Panel } from './Panel';
import type { ContextNote } from '../types';

interface ContextNotesPanelProps {
  notes: ContextNote[];
}

export function ContextNotesPanel({ notes }: ContextNotesPanelProps) {
  return (
    <Panel title="補助情報" hint="停滞の件数ではなく、なぜ・共有・認識の観点">
      {notes.length === 0 ? (
        <p className="text-base text-slate-500">補足すべき文脈はありません。</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-md border border-slate-700/40 bg-[#0d131c] px-4 py-3"
            >
              <p className="font-mono text-sm uppercase tracking-wider text-slate-500">
                {CONTEXT_NOTE_CATEGORY[note.category].label}
              </p>
              <p className="mt-1 text-base font-medium text-slate-200">{note.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{note.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
