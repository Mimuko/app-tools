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
        <p className="text-base obs-text-muted">補足すべき文脈はありません。</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="obs-surface-inset rounded-md px-4 py-3"
            >
              <p className="font-mono text-sm uppercase tracking-wider obs-text-muted">
                {CONTEXT_NOTE_CATEGORY[note.category].label}
              </p>
              <p className="mt-1 text-base font-medium obs-text-primary">{note.title}</p>
              <p className="mt-1 text-sm leading-relaxed obs-text-muted">{note.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
