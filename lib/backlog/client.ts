import { getBacklogApiBase, getBacklogApiKey } from './env';

export class BacklogApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: string,
  ) {
    super(message);
    this.name = 'BacklogApiError';
  }
}

async function backlogFetch<T>(path: string, query?: Record<string, string | string[]>): Promise<T> {
  const base = getBacklogApiBase();
  const apiKey = getBacklogApiKey();
  if (!base || !apiKey) {
    throw new Error('Backlog API is not configured');
  }

  const url = new URL(`${base}${path.startsWith('/') ? path : `/${path}`}`);
  url.searchParams.set('apiKey', apiKey);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (Array.isArray(value)) {
        for (const v of value) url.searchParams.append(key, v);
      } else {
        url.searchParams.set(key, value);
      }
    }
  }

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 0 },
  });

  const text = await res.text();
  if (!res.ok) {
    throw new BacklogApiError(`Backlog API ${res.status}: ${path}`, res.status, text);
  }

  return JSON.parse(text) as T;
}

export interface BacklogUser {
  id: number;
  userId: string;
  name: string;
  mailAddress?: string;
  roleType?: number;
}

export interface BacklogStatus {
  id: number;
  projectId: number;
  name: string;
  color: string;
  displayOrder: number;
}

export interface BacklogProject {
  id: number;
  projectKey: string;
  name: string;
  archived: boolean;
}

export interface BacklogIssue {
  id: number;
  projectId: number;
  issueKey: string;
  summary: string;
  description?: string;
  updated: string;
  created: string;
  status: { id: number; name: string };
  assignee?: BacklogUser | null;
  createdUser: BacklogUser;
}

export interface BacklogChangeLogEntry {
  field: string;
  newValue?: string | null;
  originalValue?: string | null;
}

export interface BacklogComment {
  id: number;
  content: string | null;
  created: string;
  updated?: string;
  createdUser: BacklogUser;
  changeLog?: BacklogChangeLogEntry[] | null;
}

export function getMyself(): Promise<BacklogUser> {
  return backlogFetch<BacklogUser>('/users/myself');
}

export function getProject(projectKey: string): Promise<BacklogProject> {
  return backlogFetch<BacklogProject>(`/projects/${encodeURIComponent(projectKey)}`);
}

export function getProjectStatuses(projectId: number): Promise<BacklogStatus[]> {
  return backlogFetch<BacklogStatus[]>(`/projects/${projectId}/statuses`);
}

export async function getAllIssues(projectId: number): Promise<BacklogIssue[]> {
  const all: BacklogIssue[] = [];
  let offset = 0;
  const count = 100;

  while (true) {
    const batch = await backlogFetch<BacklogIssue[]>('/issues', {
      'projectId[]': String(projectId),
      count: String(count),
      offset: String(offset),
      sort: 'updated',
      order: 'desc',
    });
    all.push(...batch);
    if (batch.length < count) break;
    offset += count;
    if (offset > 5000) break;
  }

  return all;
}

export function getIssueComments(
  issueKey: string,
  count = 10,
): Promise<BacklogComment[]> {
  return backlogFetch<BacklogComment[]>(`/issues/${encodeURIComponent(issueKey)}/comments`, {
    count: String(count),
    order: 'desc',
  });
}
