import 'server-only';

import { getBacklogIssueUrl } from '@/lib/backlog/issue-url';
import type { DirectorPrompt } from '../types';

export function enrichDirectorPrompts(prompts: DirectorPrompt[]): DirectorPrompt[] {
  return prompts.map((p) => ({
    ...p,
    issueUrl: getBacklogIssueUrl(p.issueKey) ?? undefined,
  }));
}
