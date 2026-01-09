import type { FormData } from '@/types/form';
import { isVisible } from './visibility';

function formatRequired(value: string | string[] | undefined, label: string): string {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return `⚠ ${label}：未確定`;
    }
    return value.join('、');
  }
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `⚠ ${label}：未確定`;
  }
  return String(value);
}

function formatOptional(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join('、') : '';
  }
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return '';
  }
  return String(value);
}

/**
 * テキストを行ごとに処理してBacklog記法に変換
 * - `■` で始まる行を `*` (見出し1) に変換
 * - `・` で始まる行を `-` (箇条書き) に変換
 * - `※` で始まる行はそのまま（注釈として）
 */
function convertToBacklogFormat(text: string): string {
  const lines = text.split('\n');
  const convertedLines: string[] = [];
  let listDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 空行
    if (trimmed === '') {
      listDepth = 0;
      convertedLines.push('');
      continue;
    }

    // 見出し（■で始まる）
    if (trimmed.startsWith('■')) {
      listDepth = 0;
      const heading = trimmed.replace(/^■\s*/, '');
      convertedLines.push(`* ${heading}`);
      continue;
    }

    // 箇条書き（・で始まる）
    if (trimmed.startsWith('・')) {
      const item = trimmed.replace(/^・\s*/, '');
      convertedLines.push(`- ${item}`);
      listDepth = 1;
      continue;
    }

    // 警告メッセージ（*で始まる）を太字に変換
    if (trimmed.startsWith('*') && !trimmed.startsWith('**')) {
      const content = trimmed.replace(/^\*\s*/, '');
      convertedLines.push(`''${content}''`);
      continue;
    }

    // その他の行はそのまま
    convertedLines.push(line);
  }

  return convertedLines.join('\n');
}

// Backlog分割ルール（共通ブロック）
const BACKLOG_SPLIT_RULE = `【Backlog起票ルール】
・設計／調査：1課題
・実装：設計完了後に別課題
・同一課題でのフェーズ混在は禁止`;

/**
 * 設計・調査フェーズ用Backlogテンプレを生成
 */
function generateDesignSurveyBacklog(data: FormData): string {
  const lines: string[] = [];

  lines.push('* フェーズ');
  lines.push('設計・調査フェーズ（実装前）');
  lines.push('');

  lines.push('* 目的');
  lines.push('実装に進むために、要件・実現可否・影響範囲を整理する。');
  lines.push('');

  lines.push('* 背景・相談内容');
  if (data.projectName) {
    lines.push(`案件名：${formatRequired(data.projectName, '案件名')}`);
  }
  lines.push(formatRequired(data.purposeKPI, '目的/KPI'));
  lines.push('');

  lines.push('* 対象範囲');
  lines.push(formatRequired(data.targetScope, '対象範囲'));
  if (data.excludedScope) {
    lines.push(`今回対応しない範囲：${data.excludedScope}`);
  }
  lines.push('');

  // デザインの関与方針（設計・調査フェーズ専用）
  if (data.phase === 'design_survey') {
    lines.push('* デザインの関与方針（設計・調査フェーズ）');
    if (data.designInvolvementPolicy === 'design_judgment_needed') {
      lines.push('デザイン要否を含めて判断');
      if (data.designJudgmentReference && data.designJudgmentReference.trim() !== '') {
        lines.push('参照元：');
        const referenceLines = data.designJudgmentReference.split('\n').filter(line => line.trim() !== '');
        referenceLines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed.startsWith('・')) {
            lines.push(trimmed.replace(/^・\s*/, '- '));
          } else {
            lines.push(`- ${trimmed}`);
          }
        });
      }
    } else if (data.designInvolvementPolicy === 'existing_tone_judgment') {
      lines.push('既存トンマナを前提に設計判断');
      if (data.designJudgmentReference && data.designJudgmentReference.trim() !== '') {
        lines.push('参照元：');
        const referenceLines = data.designJudgmentReference.split('\n').filter(line => line.trim() !== '');
        referenceLines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed.startsWith('・')) {
            lines.push(trimmed.replace(/^・\s*/, '- '));
          } else {
            lines.push(`- ${trimmed}`);
          }
        });
      }
    } else if (data.designInvolvementPolicy === 'no_design_judgment') {
      lines.push('デザイン判断不要（仕様固定前提）');
    }
    lines.push('');
  } else {
    // 実装フェーズ用（既存のロジック）
    lines.push('* デザイン方針');
    if (data.designRole === 'design_creation') {
      lines.push('本件はデザイン作成を含む対応となります。');
    } else if (data.designRole === 'existing_tone') {
      lines.push('新規デザイン作成は行わず、');
      lines.push('既存サイトのデザイン・UIルールを踏襲して実装を行います。');
      if (data.existingDesignReference) {
        lines.push('');
        lines.push('※参照元：');
        lines.push(data.existingDesignReference);
      }
    } else if (data.designRole === 'spec_fixed') {
      lines.push('デザインは完全に確定しており、');
      lines.push('指定された仕様・既存コードをそのまま使用します。');
    }
    lines.push('');
  }

  lines.push('* 調査・設計内容');
  lines.push('- 要件整理');
  lines.push('- 実現可否の確認');
  lines.push('- 影響範囲／制約の洗い出し');
  lines.push('- 実装方針の整理');
  lines.push('');

  lines.push('* 成果物（想定）');
  lines.push('- 実装可否の判断材料');
  lines.push('- 要件定義 or 仕様整理メモ');
  lines.push('- 次フェーズ（実装）の前提条件');
  lines.push('');

  // 表示条件（検討中）- 設計・調査フェーズ時のみ
  if (
    isVisible('displayRule', data) &&
    data.displayRule &&
    data.displayRule.trim() !== ''
  ) {
    lines.push('* 表示条件（検討中）');
    const criteriaLines = data.displayRule.split('\n').filter(line => line.trim() !== '');
    criteriaLines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('・')) {
        lines.push(trimmed.replace(/^・\s*/, '- '));
      } else {
        lines.push(trimmed);
      }
    });
    lines.push('');
    lines.push('※本内容は設計・調査フェーズでの整理事項であり、確定仕様ではありません。');
    lines.push('');
  }

  // 実装方針（検討中）- 設計・調査フェーズ時のみ
  lines.push('* 実装方針（検討中）');
  if (data.implementationPolicy === 'A') {
    lines.push('管理画面からの更新・運用を優先した実装とします。');
  } else if (data.implementationPolicy === 'B') {
    lines.push('見た目を固定し、デザイン崩れを防ぐ実装とします。');
  } else if (data.implementationPolicy === 'MIX') {
    lines.push('更新が必要な部分は管理画面から、');
    lines.push('見た目のルールはCSSで制御する実装とします。');
  } else if (data.implementationPolicy === 'TBD') {
    lines.push('実装方針は未定のため、設計・調査フェーズで検討します。');
  }
  lines.push('');
  lines.push('※本方針は設計・調査フェーズでの検討事項です。');
  lines.push('');

  // 受け入れ条件（判断観点）- 設計・調査フェーズ時のみ
  if (data.acceptanceCriteria && data.acceptanceCriteria.trim() !== '') {
    lines.push('* 受け入れ条件（判断観点）');
    const criteriaLines = data.acceptanceCriteria.split('\n').filter(line => line.trim() !== '');
    criteriaLines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('・')) {
        lines.push(trimmed.replace(/^・\s*/, '- '));
      } else {
        lines.push(trimmed);
      }
    });
    lines.push('');
    lines.push('※本条件は設計完了可否の判断材料として使用します。');
    lines.push('');
  }

  // スケジュール（目安）- 設計・調査フェーズ時のみ
  if (data.designImplementationStartDate && data.designImplementationStartDate.trim() !== '') {
    lines.push('* スケジュール（目安）');
    lines.push(`実装着手の希望時期：${data.designImplementationStartDate}`);
    lines.push('※設計内容により前後する可能性があります。');
    lines.push('');
  }

  // 判断・連絡 - 設計・調査フェーズ時のみ
  if (
    (data.designSpecDecision && data.designSpecDecision.trim() !== '') ||
    (data.designUnclearResponse && data.designUnclearResponse.trim() !== '')
  ) {
    lines.push('* 判断・連絡');
    if (data.designSpecDecision && data.designSpecDecision.trim() !== '') {
      lines.push(`仕様・技術判断：${data.designSpecDecision}`);
    }
    if (data.designUnclearResponse && data.designUnclearResponse.trim() !== '') {
      lines.push(`不明時の対応：${data.designUnclearResponse}`);
    }
    lines.push('');
  }

  // 納品後の運用・マニュアル（想定）- 設計・調査フェーズ時のみ
  if (data.designManualPlan && data.designManualPlan.trim() !== '') {
    lines.push('* 納品後の運用・マニュアル（想定）');
    const manualLines = data.designManualPlan.split('\n').filter(line => line.trim() !== '');
    manualLines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('・')) {
        lines.push(trimmed.replace(/^・\s*/, '- '));
      } else {
        lines.push(trimmed);
      }
    });
    lines.push('');
  }

  lines.push('* 備考');
  lines.push('※本課題では実装は行いません。');
  lines.push('※実装に進むための判断材料を整理することが目的です。');
  lines.push('※設計完了後、実装フェーズは別課題として起票する');
  lines.push('※同一課題でのフェーズ混在は禁止');

  return lines.join('\n');
}

/**
 * 実装フェーズ用Backlogテンプレを生成
 */
function generateImplementationBacklog(data: FormData): string {
  const lines: string[] = [];

  // 要件確定チェック=Noの場合、警告を表示
  if (data.phase === 'implementation' && data.requirementConfirmed === 'not_confirmed') {
    lines.push("''【警告：要件未確定】''");
    lines.push('⚠ 要件未確定のまま実装に進むと手戻り・追加工数の原因になります');
    lines.push('⚠ 本課題は起票できません。まず設計・調査フェーズで要件を確定してください。');
    lines.push('');
  }

  lines.push('* フェーズ');
  lines.push('実装フェーズ');
  lines.push('');

  lines.push('* 前提');
  lines.push('- 設計・調査フェーズ完了済み');
  lines.push('- 要件確定（要件定義URLあり）');
  lines.push('');

  if (data.requirementDocumentUrl) {
    lines.push('* 要件定義書');
    lines.push(data.requirementDocumentUrl);
    if (data.requirementDocumentVersion) {
      lines.push(`版/最終更新日：${data.requirementDocumentVersion}`);
    }
    lines.push('');
  }

  lines.push('* 実装内容');
  lines.push(formatRequired(data.projectName, '案件名'));
  lines.push('');
  lines.push(formatRequired(data.targetScope, '対象範囲'));
  if (data.releaseIncludedPages) {
    lines.push(`リリースに含めるページ・機能：${formatRequired(data.releaseIncludedPages, 'リリースに含めるページ・機能')}`);
  }
  lines.push('');

  // デザイン方針
  lines.push('* デザイン方針');
  if (data.designRole === 'design_creation') {
    // ① デザイン作成あり
    lines.push('本件はデザイン作成を含む対応となります。');
  } else if (data.designRole === 'existing_tone') {
    // ② 既存トンマナを踏襲して実装
    lines.push('新規デザイン作成は行わず、');
    lines.push('既存サイトのデザイン・UIルールを踏襲して実装を行います。');
    if (data.existingDesignReference) {
      lines.push('');
      lines.push('※参照元：');
      lines.push(data.existingDesignReference);
    }
  } else if (data.designRole === 'spec_fixed') {
    // ③ デザイン判断なし（仕様固定）
    lines.push('デザインは完全に確定しており、');
    lines.push('指定された仕様・既存コードをそのまま使用します。');
  }
  lines.push('');

  // 実装方針
  lines.push('* 実装方針');
  if (data.implementationPolicy === 'A') {
    lines.push('管理画面からの更新・運用を優先した実装とします。');
  } else if (data.implementationPolicy === 'B') {
    lines.push('見た目を固定し、デザイン崩れを防ぐ実装とします。');
  } else if (data.implementationPolicy === 'MIX') {
    lines.push('更新が必要な部分は管理画面から、');
    lines.push('見た目のルールはCSSで制御する実装とします。');
  } else if (data.implementationPolicy === 'TBD') {
    lines.push('実装方針は未定のため、設計・調査フェーズで検討します。');
  }
  if (isVisible('adminChangeableRange', data) && data.adminChangeableRange) {
    lines.push(`管理画面で変更できる前提の範囲：${data.adminChangeableRange}`);
  }
  if (isVisible('fixedTargets', data) && data.fixedTargets) {
    lines.push(`CSS固定する対象：${formatRequired(data.fixedTargets, 'CSS固定する対象')}`);
  }
  lines.push('');

  // 表示条件（補足）- 要件確定チェック=Yes かつ 入力ありの場合のみ
  if (
    data.phase === 'implementation' &&
    data.requirementConfirmed === 'confirmed' &&
    isVisible('displayRule', data) &&
    data.displayRule &&
    data.displayRule.trim() !== ''
  ) {
    lines.push('* 表示条件（補足）');
    lines.push(data.displayRule);
    lines.push('');
  } else if (
    data.phase === 'implementation' &&
    data.requirementConfirmed === 'not_confirmed' &&
    (data.contentRendering === 'dynamic_required' ||
      data.contentRendering === 'dynamic_later')
  ) {
    // 要件確定 = No の場合、任意で注記を追加
    lines.push('※表示条件は設計・調査フェーズで整理予定');
    lines.push('');
  }

  // 完了条件（受け入れ条件）
  lines.push('* 完了条件');
  if (data.acceptanceCriteria && data.acceptanceCriteria.trim() !== '') {
    // 入力内容を行ごとに分割して表示（Backlog記法に変換）
    const criteriaLines = data.acceptanceCriteria.split('\n').filter(line => line.trim() !== '');
    criteriaLines.forEach(line => {
      const trimmed = line.trim();
      // ・で始まる行を-に変換
      if (trimmed.startsWith('・')) {
        lines.push(trimmed.replace(/^・\s*/, '- '));
      } else {
        lines.push(trimmed);
      }
    });
  } else {
    // デフォルトの完了条件
    lines.push('- 要件通りに実装されている');
    lines.push('- テスト／確認完了');
    lines.push('- 指定環境へ反映済み');
  }
  lines.push('');

  // G. 今回のリリース範囲・優先順位
  if (data.releaseExcludedPages) {
    lines.push('* 今回のリリースに含めないページ・機能');
    lines.push(data.releaseExcludedPages);
    lines.push('');
  }

  // H. スケジュール
  lines.push('* スケジュール');
  if (isVisible('designFixDate', data) && data.designFixDate) {
    lines.push(`デザインFIX日：${data.designFixDate}`);
  }
  if (data.implementationStartDate) {
    lines.push(`実装着手OK日：${data.implementationStartDate}`);
  }
  if (data.internalReviewDeadline) {
    lines.push(`社内確認期限：${data.internalReviewDeadline}`);
  }
  if (data.uatDeadline) {
    lines.push(`UAT/承認期限：${data.uatDeadline}`);
  }
  if (data.releaseDate) {
    lines.push(`リリース日：${data.releaseDate}`);
  }
  if (data.releaseDateReason) {
    lines.push(`リリース日がマストの場合、その理由：${data.releaseDateReason}`);
  }
  lines.push('');

  // I. 判断・連絡
  if (data.decisionMaker || data.implementationConsultant || data.contactMethod) {
    lines.push('* 判断・連絡');
    if (data.decisionMaker) {
      lines.push(`判断責任者：${data.decisionMaker}`);
    }
    if (data.implementationConsultant) {
      lines.push(`実装相談先：${data.implementationConsultant}`);
    }
    if (data.contactMethod) {
      lines.push(`連絡手段：${data.contactMethod}`);
    }
    if (data.emergencyContactPolicy) {
      lines.push(`緊急時の連絡方針：${data.emergencyContactPolicy}`);
    }
    lines.push('');
  }

  // J. 納品後の運用・マニュアル
  if (data.manualPlan || data.updateOwner || data.operationExplanation) {
    lines.push('* 納品後の運用・マニュアル');
    const manualLabels: Record<string, string> = {
      director: 'ディレクター作成',
      implementer: '実装側作成（要調整）',
      later: '次フェーズ',
      tbd: '未定',
    };
    if (data.manualPlan) {
      lines.push(`マニュアル作成方針：${manualLabels[data.manualPlan] || data.manualPlan}`);
    }
    if (isVisible('manualScope', data) && data.manualScope) {
      lines.push(`作成範囲：${data.manualScope}`);
    }
    if (isVisible('manualDeadline', data) && data.manualDeadline) {
      lines.push(`期限：${data.manualDeadline}`);
    }
    if (isVisible('scheduleApproval', data) && data.scheduleApproval) {
      lines.push(`スケジュール合意の有無：${data.scheduleApproval}`);
    }
    if (data.updateOwner) {
      lines.push(`更新担当：${data.updateOwner}`);
    }
    if (data.operationExplanation) {
      lines.push(`操作説明：${data.operationExplanation}`);
    }
    lines.push('');
  }

  lines.push('* 備考');
  lines.push('※要件変更が発生した場合は、設計フェーズに差し戻す');
  lines.push('※同一課題でのフェーズ混在は禁止');

  return lines.join('\n');
}

/**
 * Backlogテキストを生成
 * 返り値は { slack: Slack用（廃止予定の互換性のため）, design: 設計・調査用, implementation: 実装用 }
 */
export function generateBacklogText(data: FormData): {
  slack: string;
  design: string;
  implementation: string;
} {
  const designText = generateDesignSurveyBacklog(data);
  const implementationText = generateImplementationBacklog(data);

  // 互換性のため、slack用には設計用テキストを返す（後で削除可能）
  return {
    slack: designText,
    design: designText,
    implementation: implementationText,
  };
}
