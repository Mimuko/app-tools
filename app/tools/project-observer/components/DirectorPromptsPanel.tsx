import { Panel } from './Panel';
import { DirectorPromptsList } from './DirectorPromptsList';
import type { DirectorPrompt } from '../types';

interface DirectorPromptsPanelProps {
  prompts: DirectorPrompt[];
  title?: string;
  /** 指定時は 6 件ずつ「もっと見る」で追加表示 */
  pageSize?: number;
}

export function DirectorPromptsPanel({
  prompts,
  title = 'ディレクターへの確認促し',
  pageSize,
}: DirectorPromptsPanelProps) {
  return (
    <Panel title={title} hint="副目的: 次に何を確認・優先すべきか（PoCはルールベース）">
      <DirectorPromptsList prompts={prompts} pageSize={pageSize} />
    </Panel>
  );
}
