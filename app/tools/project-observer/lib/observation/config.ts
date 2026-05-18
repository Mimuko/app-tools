/**
 * 朝会支援UI — 観測仕様（テナント設定を参照）
 * Backlogがマスタ。本ツールは認知しやすく整理するレイヤー。
 */
import { getTenantModule } from '@/lib/tenant/registry';

const tenant = getTenantModule();

export const OBSERVATION_CONFIG = tenant.OBSERVATION_CONFIG;
export const DIRECTOR_TEAM = tenant.DIRECTOR_TEAM;

export function isDirector(backlogUserName: string): boolean {
  return DIRECTOR_TEAM.some((d) => d.backlogName === backlogUserName);
}

/** 担当者または登録者がディレクターチームの課題か */
export function isDirectorTeamScopedIssue(issue: {
  assignee?: { name: string } | null;
  createdUser: { name: string };
}): boolean {
  const assignee = issue.assignee?.name?.trim();
  if (assignee && isDirector(assignee)) return true;
  const creator = issue.createdUser.name?.trim();
  if (creator && isDirector(creator)) return true;
  return false;
}

/** 観測スコープ内のディレクターが課題担当のときのみ Backlog 表示名を返す */
export function getInScopeAssigneeName(
  backlogAssigneeName: string | null | undefined,
): string | null {
  const name = backlogAssigneeName?.trim();
  if (!name || !isDirector(name)) return null;
  return name;
}
