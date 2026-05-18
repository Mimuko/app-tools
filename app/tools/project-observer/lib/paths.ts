/** trailingSlash: true に合わせたプロジェクト詳細 URL */
export function projectDetailPath(projectId: string): string {
  return `/tools/project-observer/projects/${encodeURIComponent(projectId)}/`;
}
