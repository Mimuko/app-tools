import { STATE_KIND_STYLES } from './constants';
import { Panel } from './Panel';
import type { CurrentState } from '../types';

interface CurrentStatesPanelProps {
  states: CurrentState[];
}

export function CurrentStatesPanel({ states }: CurrentStatesPanelProps) {
  return (
    <Panel title="認識上の論点" hint="要件・合意・暫定・リスクの整理（断定ではありません）">
      {states.length === 0 ? (
        <p className="text-base obs-text-muted">特記すべき状態は検出されていません。</p>
      ) : (
        <ul className="space-y-3">
          {states.map((state) => (
            <li
              key={`${state.kind}-${state.label}`}
              className={`rounded-md border px-4 py-3 ${STATE_KIND_STYLES[state.kind]}`}
            >
              <p className="text-base font-medium">{state.label}</p>
              <p className="mt-1 text-sm opacity-80">{state.note}</p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
