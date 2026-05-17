import {
  loadAllProjects,
  loadProjectDetail,
  loadAllProjectIds,
} from '../lib/load-projects';
import { enrichDirectorPrompts } from '../lib/enrich-prompts';
import type { DirectorPrompt, FleetAssigneeSnapshot, ProjectDetail, ProjectSummary } from '../types';
import { isDirector } from '../lib/observation/config';

export async function getProjectSummaries(): Promise<ProjectSummary[]> {
  return loadAllProjects();
}

export async function getProjectDetail(id: string): Promise<ProjectDetail | undefined> {
  return loadProjectDetail(id);
}

export async function getAllProjectIds(): Promise<string[]> {
  return loadAllProjectIds();
}

export async function getDataObservedAt(): Promise<string> {
  const projects = await loadAllProjects();
  return projects[0]?.dataObservedAt ?? new Date().toISOString();
}

export async function getFleetDirectorPrompts(): Promise<DirectorPrompt[]> {
  const projects = await loadAllProjects();
  return enrichDirectorPrompts(
    projects
      .flatMap((p) => p.directorPrompts)
      .filter((p) => p.priority === 'high')
      .slice(0, 6),
  );
}

export async function getFleetAssigneeSnapshots(): Promise<FleetAssigneeSnapshot[]> {
  const projects = await loadAllProjects();
  const map = new Map<string, FleetAssigneeSnapshot>();

  for (const project of projects) {
    for (const load of project.assigneeLoads) {
      if (!isDirector(load.name)) continue;
      const existing = map.get(load.id);
      const prompt = project.directorPrompts.find((p) => p.forDirector === load.name);
      if (existing) {
        existing.projectNames.push(project.name);
        existing.totalAwaitingConfirmation += load.awaitingConfirmationCount;
        existing.totalUnreplied += load.unrepliedIssueCount;
        existing.totalNeedsReview += load.needsReviewCount;
        existing.totalAttentionIssues += load.attentionIssueCount;
        if (rankLoad(load.cognitiveLoad) > rankLoad(existing.cognitiveLoad)) {
          existing.cognitiveLoad = load.cognitiveLoad;
        }
        if (prompt?.priority === 'high') existing.topPrompt = prompt.summary;
      } else {
        map.set(load.id, {
          assigneeId: load.id,
          name: load.name,
          roleLabel: 'ディレクション',
          projectNames: [project.name],
          totalAwaitingConfirmation: load.awaitingConfirmationCount,
          totalUnreplied: load.unrepliedIssueCount,
          totalNeedsReview: load.needsReviewCount,
          totalAttentionIssues: load.attentionIssueCount,
          cognitiveLoad: load.cognitiveLoad,
          topPrompt: prompt?.summary,
        });
      }
    }
  }

  return [...map.values()].sort(
    (a, b) => rankLoad(b.cognitiveLoad) - rankLoad(a.cognitiveLoad),
  );
}

function rankLoad(level: FleetAssigneeSnapshot['cognitiveLoad']): number {
  return { high: 3, elevated: 2, moderate: 1, light: 0 }[level];
}
