import {
  loadAllProjects,
  loadProjectDetail,
  loadAllProjectIds,
} from '../lib/load-projects';
import { enrichDirectorPrompts } from '../lib/enrich-prompts';
import { buildFleetDirectorActions } from '../lib/fleet-director-actions';
import type { DirectorPrompt, FleetDirectorAction, ProjectDetail, ProjectSummary } from '../types';

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
      .filter((p) => p.priority === 'high'),
  );
}

export async function getFleetDirectorActions(): Promise<FleetDirectorAction[]> {
  const projects = await loadAllProjects();
  return buildFleetDirectorActions(projects);
}
