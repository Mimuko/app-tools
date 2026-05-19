import { OBSERVATION_CONFIG } from '@/app/tools/project-observer/lib/observation/config';
import { parseCommentsNotation } from '@/app/tools/project-observer/lib/observation/comment-notation';
import type { ShareStatus } from '@/app/tools/project-observer/types';
import { stripBacklogMarkup } from './text';
import type { BacklogComment, BacklogIssue } from './client';

export interface IssueSignalScan {
  unfixed: boolean;
  provisional: boolean;
  requirementsUnset: boolean;
  specUndecided: boolean;
  nextActionText: string;
  nextActionValid: boolean;
  lastCommentAuthor?: string;
  lastCommentInternal: boolean;
  lastCommentAt?: string;
}

function matchesAny(text: string, patterns: readonly RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

export function scanIssueText(
  combinedText: string,
  commentTextsNewestFirst: string[] = [],
): Omit<IssueSignalScan, 'lastCommentAuthor' | 'lastCommentInternal' | 'lastCommentAt'> {
  const notation = parseCommentsNotation(
    commentTextsNewestFirst.length > 0 ? commentTextsNewestFirst : [combinedText],
  );
  const nextActionText = notation.nextAction ?? '';

  return {
    unfixed: /未FIX|未fix|まだFIX/i.test(combinedText),
    provisional: /暫定|一旦対応|仮対応/i.test(combinedText),
    requirementsUnset: /要件未確定|要件未決/i.test(combinedText),
    specUndecided: /仕様未決|仕様未確定|仕様未合意/i.test(combinedText),
    nextActionText,
    nextActionValid: Boolean(notation.nextAction),
  };
}

export function scanIssue(
  issue: BacklogIssue,
  comments: BacklogComment[],
  isInternalUser: (user: { mailAddress?: string; name: string }) => boolean,
): IssueSignalScan {
  const desc = stripBacklogMarkup(issue.description);
  const commentTexts = comments.map((c) => stripBacklogMarkup(c.content));
  const combined = [desc, ...commentTexts].filter(Boolean).join('\n');
  const base = scanIssueText(combined, commentTexts);

  const latest = comments[0];
  const lastCommentInternal = latest ? isInternalUser(latest.createdUser) : false;

  return {
    ...base,
    lastCommentAuthor: latest?.createdUser.name,
    lastCommentInternal,
    lastCommentAt: latest?.created,
  };
}

export function issueShareStatus(scan: IssueSignalScan): ShareStatus {
  if (scan.unfixed || scan.provisional || scan.requirementsUnset || scan.specUndecided || !scan.nextActionValid) {
    return 'attention';
  }
  return 'stable';
}

export function issueReasons(scan: IssueSignalScan): string[] {
  const reasons: string[] = [];
  if (scan.unfixed) reasons.push('未FIX');
  if (scan.provisional) reasons.push('暫定対応');
  if (scan.requirementsUnset) reasons.push('要件未確定');
  if (scan.specUndecided) reasons.push('仕様未決');
  if (!scan.nextActionValid) reasons.push('次アクション不明');
  return reasons;
}

export function isAttentionKeywordHit(text: string): boolean {
  return matchesAny(text, OBSERVATION_CONFIG.attentionCommentPatterns);
}
