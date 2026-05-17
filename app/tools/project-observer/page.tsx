import 'server-only';

import Link from 'next/link';
import { DataFreshnessBanner } from './components/DataFreshnessBanner';
import { DirectorPromptsPanel } from './components/DirectorPromptsPanel';
import { FleetAssigneeOverview } from './components/FleetAssigneeOverview';
import { FleetSummary } from './components/FleetSummary';
import { ObservationDisclaimer } from './components/ObservationDisclaimer';
import { ObserverShell } from './components/ObserverShell';
import { ProjectCard } from './components/ProjectCard';
import { StatusLegend } from './components/StatusLegend';
import { getDataSourceLabel, isUsingLiveBacklog } from './lib/load-projects';
import {
  getDataObservedAt,
  getFleetAssigneeSnapshots,
  getFleetDirectorPrompts,
  getProjectSummaries,
} from './mock/projects';

export default async function ProjectObserverPage() {
  const projects = await getProjectSummaries();
  const assigneeSnapshots = await getFleetAssigneeSnapshots();
  const fleetPrompts = await getFleetDirectorPrompts();
  const dataObservedAt = await getDataObservedAt();
  const live = isUsingLiveBacklog();

  return (
    <ObserverShell
      title="朝会支援UI"
      subtitle={
        live
          ? 'Backlog実データ — ディレクターチーム向け'
          : 'モックデータ — ディレクターチーム向け'
      }
      backHref="/tools"
      backLabel="ツール一覧"
    >
      <ObservationDisclaimer />
      <DataFreshnessBanner dataObservedAt={dataObservedAt} />

      {live && (
        <p className="obs-live-banner mb-4 rounded px-3 py-2 text-sm">
          データソース: {getDataSourceLabel()}（{projects.length} プロジェクト同期済み）
        </p>
      )}

      <p className="mb-8 max-w-2xl text-base leading-relaxed obs-text-muted">
        完了率や工数ではなく、状態・更新・確認待ち・次アクション・認識共有を観測します。
      </p>

      <FleetSummary projects={projects} />

      {fleetPrompts.length > 0 && (
        <div className="obs-section-secondary">
          <DirectorPromptsPanel
            prompts={fleetPrompts}
            title="チーム全体 — 優先確認"
            pageSize={6}
          />
        </div>
      )}

      <FleetAssigneeOverview snapshots={assigneeSnapshots} />

      <StatusLegend />

      <div className="mb-4 flex items-center justify-between">
        <h2 className="obs-heading">プロジェクト全体計測</h2>
        <span className="text-sm obs-text-faint">{projects.length} PROJECTS</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      <footer className="obs-divider mt-10 border-t pt-6 text-center">
        <p className="text-sm obs-text-faint">
          {getDataSourceLabel()} · 初回表示は Backlog API 取得のため数十秒かかることがあります
        </p>
        <Link href="/tools" className="obs-link mt-2 inline-block text-sm">
          ツール一覧へ戻る
        </Link>
      </footer>
    </ObserverShell>
  );
}
