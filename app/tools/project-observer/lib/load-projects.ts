import 'server-only';

import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { syncProjectFromBacklog } from '@/lib/backlog/sync-project';
import {
  shouldUseBacklogMock,
  getBacklogProjectKeys,
  getBacklogApiBase,
} from '@/lib/backlog/env';
import {
  evaluateAllRecords,
  sortProjects,
} from './evaluate-records';
import type { ProjectDetail } from '../types';
import { rawProjects } from '../mock/raw-projects';
import type { ProjectObservationExtras } from './observation/types';
import type { ProjectSignals } from './observation/types';
import { getTenantSnapshotPath } from '@/lib/tenant/paths';

let cached: { at: number; projects: ProjectDetail[] } | null = null;
let loadInFlight: Promise<ProjectDetail[]> | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

function snapshotPath(): string {
  return getTenantSnapshotPath();
}

function observationNow(): string {
  return new Date().toISOString();
}

function loadFromSnapshot(): ProjectDetail[] | null {
  const file = snapshotPath();
  if (!existsSync(file)) return null;
  try {
    const raw = JSON.parse(readFileSync(file, 'utf8')) as {
      observedAt: string;
      records: Array<{
        signals: Omit<ProjectSignals, 'dataObservedAt'>;
        extras: ProjectObservationExtras;
      }>;
    };
    return sortProjects(evaluateAllRecords(raw.records, raw.observedAt));
  } catch {
    return null;
  }
}

function useSnapshotFirst(): boolean {
  if (process.env.BACKLOG_USE_LIVE === 'true') return false;
  if (process.env.BACKLOG_USE_SNAPSHOT === 'true') return true;
  // スナップショットファイルがあれば優先（CRH: sync 後デプロイ / 開発時の 429 回避）
  if (existsSync(snapshotPath())) {
    if (process.env.NODE_ENV === 'development') {
      return process.env.BACKLOG_USE_LIVE_IN_DEV !== 'true';
    }
    return true;
  }
  return false;
}

async function loadFromBacklog(): Promise<ProjectDetail[]> {
  const observedAt = new Date(observationNow());
  const keys = getBacklogProjectKeys();
  const records = [];

  for (const key of keys) {
    try {
      const record = await syncProjectFromBacklog(key, observedAt);
      records.push(record);
    } catch (e) {
      console.error(`[project-observer] Failed to sync ${key}:`, e);
    }
  }

  if (records.length === 0) {
    throw new Error('No projects synced from Backlog');
  }

  return sortProjects(
    evaluateAllRecords(records, observedAt.toISOString()),
  );
}

function loadFromMock(): ProjectDetail[] {
  const dataObservedAt = observationNow();
  return sortProjects(
    evaluateAllRecords(
      rawProjects.map((r) => ({ signals: r.signals, extras: r.extras })),
      dataObservedAt,
    ),
  );
}

async function loadAllProjectsUncached(): Promise<ProjectDetail[]> {
  if (shouldUseBacklogMock()) {
    return loadFromMock();
  }

  if (useSnapshotFirst()) {
    const snap = loadFromSnapshot();
    if (snap?.length) return snap;
  }

  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.projects;
  }

  try {
    const projects = await loadFromBacklog();
    cached = { at: Date.now(), projects };
    return projects;
  } catch (e) {
    console.error('[project-observer] Backlog live fetch failed:', e);
    const snap = loadFromSnapshot();
    if (snap?.length) return snap;
    return loadFromMock();
  }
}

/** 同時リクエストで Backlog API が多重実行されないよう dedupe */
export async function loadAllProjects(): Promise<ProjectDetail[]> {
  if (loadInFlight) return loadInFlight;
  loadInFlight = loadAllProjectsUncached().finally(() => {
    loadInFlight = null;
  });
  return loadInFlight;
}

export async function loadProjectSummaries() {
  const projects = await loadAllProjects();
  return projects;
}

export async function loadProjectDetail(id: string): Promise<ProjectDetail | undefined> {
  const projects = await loadAllProjects();
  return projects.find((p) => p.id === id);
}

export async function loadAllProjectIds(): Promise<string[]> {
  const projects = await loadAllProjects();
  return projects.map((p) => p.id);
}

export function getDataSourceLabel(): string {
  if (shouldUseBacklogMock()) return 'モック';
  const host = getBacklogApiBase().replace(/\/api\/v2$/, '').replace(/^https?:\/\//, '');
  if (useSnapshotFirst() && existsSync(snapshotPath())) {
    return `Backlogスナップショット（${host}）`;
  }
  return `Backlog 実データ（${host}）`;
}

export function isUsingLiveBacklog(): boolean {
  if (shouldUseBacklogMock()) return false;
  if (useSnapshotFirst() && existsSync(snapshotPath())) return false;
  return true;
}
