import 'server-only';

import Link from 'next/link';
import { DataFreshnessBanner } from './components/DataFreshnessBanner';
import { DirectorPromptsPanel } from './components/DirectorPromptsPanel';
import { DirectorTodayActions } from './components/DirectorTodayActions';
import { FleetSummary } from './components/FleetSummary';
import { ObservationDisclaimer } from './components/ObservationDisclaimer';
import { ObserverShell } from './components/ObserverShell';
import { ProjectCard } from './components/ProjectCard';
import { StatusLegend } from './components/StatusLegend';
import { getDataSourceLabel, isUsingLiveBacklog } from './lib/load-projects';
import {
  getDataObservedAt,
  getFleetDirectorActions,
  getFleetDirectorPrompts,
  getProjectSummaries,
} from './mock/projects';

export const dynamic = 'force-dynamic';

export default async function ProjectObserverPage() {
  const projects = await getProjectSummaries();
  const actionableProjects = projects.filter((p) => p.shareStatus !== 'stable');
  const directorActions = await getFleetDirectorActions();
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

      <DirectorTodayActions actions={directorActions} />

      <div className="mb-4 flex items-center justify-between">
        <h2 className="obs-heading">プロジェクト全体計測</h2>
        <span className="text-sm obs-text-faint">
          {actionableProjects.length} / {projects.length} PROJECTS
        </span>
      </div>

      {actionableProjects.length === 0 ? (
        <p className="obs-surface-muted rounded-lg px-5 py-8 text-center text-base obs-text-muted">
          いま確認が必要なプロジェクトはありません。
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {actionableProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <StatusLegend />

      <DataFreshnessBanner dataObservedAt={dataObservedAt} />

      {live && (
        <p className="obs-live-banner mb-4 rounded px-3 py-2 text-sm">
          データソース: {getDataSourceLabel()}（{projects.length} プロジェクト同期済み）
        </p>
      )}

      <p className="mb-8 max-w-2xl text-base leading-relaxed obs-text-muted">
        完了率や工数ではなく、案件状態と担当者の今日の確認アクションを観測します。
      </p>

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
