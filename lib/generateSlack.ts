import type { FormData } from '@/types/form';
import { isVisible } from './visibility';

const FOOTER_NOTE =
  '※未確定事項がある場合は、ディレクター側で確定のうえ再依頼ください。';

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

export function generateSlackText(data: FormData): string {
  const lines: string[] = [];
  const warnings: string[] = [];

  // 警告の収集
  if (data.constraintStatus === 'unknown') {
    warnings.push('⚠ モジュール/テーマ制約の整理が未完了の状態です（着手はリスクあり）');
  }
  if (data.contentRendering === 'undecided') {
    warnings.push('⚠ コンテンツ表示方針（静的/動的）が未定のため、手戻りリスクがあります');
  }
  if (data.implementationPolicy === 'TBD') {
    warnings.push('⚠ 実装方針が未定');
  }
  if (data.manualPlan === 'tbd') {
    warnings.push('⚠ 納品後運用（操作説明/マニュアル）が未定');
  }

  // フェーズ宣言とBacklog分割ルール
  lines.push('---');
  lines.push('今回の依頼は「設計・調査 → 実装」の2フェーズで進めます。');
  lines.push('');
  lines.push('【Backlog起票ルール】');
  lines.push('・設計／調査：1課題');
  lines.push('・実装：設計完了後に別課題');
  lines.push('・同一課題でのフェーズ混在は禁止');
  lines.push('---');
  lines.push('');

  // フェーズ表示
  if (data.phase === 'design_survey') {
    lines.push('*【設計・調査フェーズ】*');
  } else {
    lines.push('*【実装フェーズ】*');
  }
  lines.push('');

  if (warnings.length > 0) {
    lines.push('*【重要：未確定事項あり】*');
    warnings.forEach((w) => lines.push(w));
    lines.push('');
  }

  // A. 案件概要
  lines.push('*A. 案件概要*');
  lines.push(`案件名：${formatRequired(data.projectName, '案件名')}`);
  lines.push(`目的/KPI：${formatRequired(data.purposeKPI, '目的/KPI')}`);
  lines.push(`対象範囲：${formatRequired(data.targetScope, '対象範囲')}`);
  if (data.excludedScope) {
    lines.push(`今回対応しない範囲：${data.excludedScope}`);
  }
  lines.push('');

  // B. 環境・前提
  lines.push('*B. 環境・前提*');
  lines.push(`使用CMS：${formatRequired(data.cms, '使用CMS')}`);
  if (data.theme) {
    lines.push(`使用テーマ：${data.theme}`);
  }
  lines.push(`既存モジュール利用方針：${data.existingModulePolicy}`);
  if (data.touchableRange) {
    lines.push(`触って良い範囲：${data.touchableRange}`);
  }
  if (data.untouchableRange) {
    lines.push(`触れない範囲：${data.untouchableRange}`);
  }
  lines.push('');

  // C. 制約・方針
  lines.push('*C. 制約・方針*');
  const constraintLabels: Record<string, string> = {
    known: '把握している',
    partial: '一部把握',
    unknown: '把握していない',
  };
  lines.push(`CMS制約の把握状況：${constraintLabels[data.constraintStatus] || data.constraintStatus}`);
  if (data.constraintContent) {
    lines.push(`制約内容：${data.constraintContent}`);
  }
  if (isVisible('constraintNextAction', data)) {
    lines.push(`制約確認の担当/期限：${formatRequired(data.constraintNextAction, '制約確認の担当/期限')}`);
  }
  lines.push(`難しい箇所の対応方針：${data.difficultAreaPolicy}`);
  lines.push('');

  // D. デザインの関与範囲
  if (data.phase === 'design_survey') {
    // 設計・調査フェーズ専用
    lines.push('*D. デザインの関与方針（設計・調査フェーズ）*');
    if (data.designInvolvementPolicy === 'design_judgment_needed') {
      lines.push('デザイン要否を含めて判断');
      if (data.designJudgmentReference && data.designJudgmentReference.trim() !== '') {
        lines.push('参照元：');
        const referenceLines = data.designJudgmentReference.split('\n').filter(line => line.trim() !== '');
        referenceLines.forEach(line => {
          lines.push(line.trim());
        });
      }
    } else if (data.designInvolvementPolicy === 'existing_tone_judgment') {
      lines.push('既存トンマナを前提に設計判断');
      if (data.designJudgmentReference && data.designJudgmentReference.trim() !== '') {
        lines.push('参照元：');
        const referenceLines = data.designJudgmentReference.split('\n').filter(line => line.trim() !== '');
        referenceLines.forEach(line => {
          lines.push(line.trim());
        });
      }
    } else if (data.designInvolvementPolicy === 'no_design_judgment') {
      lines.push('デザイン判断不要（仕様固定前提）');
    }
    lines.push('');
  } else {
    // 実装フェーズ用（既存のロジック）
    lines.push('*D. デザイン方針*');
  
    if (data.designRole === 'design_creation') {
      // ① デザイン作成あり
      lines.push('本件はデザイン作成を含む対応となります。');
      if (isVisible('implementationPriority', data)) {
        const priority = formatRequired(data.implementationPriority, '実装優先要素');
        const reference = formatOptional(data.referenceLevel);
        lines.push(`実装優先要素：${priority}${reference ? ` / 参考要素：${reference}` : ''}`);
      }
      if (isVisible('figmaBaseFrameUrl', data)) {
        lines.push(`Figma基準フレームURL：${formatRequired(data.figmaBaseFrameUrl, 'Figma基準フレームURL')}`);
        if (data.figmaReferenceFrameUrl) {
          lines.push(`参考フレームURL：${data.figmaReferenceFrameUrl}`);
        }
        if (data.baseFrameNote) {
          lines.push(`基準フレームの補足：${data.baseFrameNote}`);
        }
      }
    } else if (data.designRole === 'existing_tone') {
      // ② 既存トンマナを踏襲して実装
      lines.push('新規デザイン作成は行わず、');
      lines.push('既存サイトのデザイン・UIルールを踏襲して実装を行います。');
      lines.push('');
      if (data.existingDesignReference) {
        lines.push('※参照元：');
        lines.push(data.existingDesignReference);
      }
      if (isVisible('figmaBaseFrameUrl', data) && data.figmaBaseFrameUrl) {
        lines.push(`Figma基準フレームURL：${data.figmaBaseFrameUrl}`);
        if (data.figmaReferenceFrameUrl) {
          lines.push(`参考フレームURL：${data.figmaReferenceFrameUrl}`);
        }
        if (data.baseFrameNote) {
          lines.push(`基準フレームの補足：${data.baseFrameNote}`);
        }
      }
    } else if (data.designRole === 'spec_fixed') {
      // ③ デザイン判断なし（仕様固定）
      lines.push('デザインは完全に確定しており、');
      lines.push('指定された仕様・既存コードをそのまま使用します。');
      if (isVisible('exceptionAllowed', data)) {
        const exceptions = formatRequired(data.exceptionAllowed, '差分許容（事前合意済）');
        lines.push(`差分許容（事前合意済）：${exceptions}`);
      }
      if (data.exceptionNote) {
        lines.push(`例外の補足：${data.exceptionNote}`);
      }
      if (isVisible('exceptionDecisionOwner', data)) {
        lines.push(`差分が出た場合の判断者：${formatRequired(data.exceptionDecisionOwner, '差分が出た場合の判断者')}`);
        lines.push('※ 実装者側での独自判断は行わず、差分が出た場合は上記判断者へ確認します。');
      }
      lines.push('');
    }
  }

  // E. コンテンツの静的/動的方針
  lines.push('*E. コンテンツの静的/動的方針*');
  const renderingLabels: Record<string, string> = {
    static_ok: '静的でOK',
    dynamic_required: '動的実装が必要',
    dynamic_later: '次フェーズで動的化',
    undecided: '未定',
  };
  lines.push(`コンテンツ表示方針：${renderingLabels[data.contentRendering] || data.contentRendering}`);

  if (data.contentRendering === 'dynamic_required' || data.contentRendering === 'dynamic_later') {
    if (isVisible('dataSourceSpec', data)) {
      lines.push(`データ元（正）：${formatRequired(data.dataSourceSpec, 'データ元（正）')}`);
    }
    if (isVisible('dataOwner', data)) {
      lines.push(`更新担当：${formatRequired(data.dataOwner, '更新担当')}`);
    }
    // 表示条件は要件確定チェック=Yes かつ 入力ありの場合のみ出力（補足として）
    if (
      isVisible('displayRule', data) &&
      data.displayRule &&
      data.displayRule.trim() !== ''
    ) {
      lines.push('*表示条件（補足）*');
      lines.push(data.displayRule);
    }
    if (isVisible('dynamicLaterTiming', data) && data.dynamicLaterTiming) {
      lines.push(`動的化予定：${data.dynamicLaterTiming}`);
    }
  } else {
    // static_ok or undecided
    if (data.contentRendering === 'static_ok') {
      const futureLabel = formatRequired(data.futureDynamicPossible, '動的化の有無');
      lines.push(`現時点は静的で対応（動的化の有無：${futureLabel}）`);
      if (data.futureDynamicPossible === 'あり' && data.futureDynamicCondition) {
        lines.push(`将来動的化の条件：${data.futureDynamicCondition}`);
      }
    } else if (data.contentRendering === 'undecided') {
      const condition = data.futureDynamicCondition || '⚠ 未確定';
      lines.push(`将来動的化の条件：${condition}`);
    }
  }
  lines.push('');

  // F. 実装方針
  lines.push('*F. 実装方針*');
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
  if (isVisible('fixedTargets', data)) {
    lines.push(`CSS固定する対象：${formatRequired(data.fixedTargets, 'CSS固定する対象')}`);
  }
  if (isVisible('clientNonEditableNote', data)) {
    lines.push(`クライアント側で変更できない点の説明方針：${formatRequired(data.clientNonEditableNote, 'クライアント側で変更できない点の説明方針')}`);
  }
  lines.push(`受け入れ条件：${formatRequired(data.acceptanceCriteria, '受け入れ条件')}`);
  lines.push('');

  // G. 今回のリリース範囲・優先順位
  lines.push('*G. 今回のリリース範囲・優先順位*');
  lines.push(`リリースに含めるページ・機能：${formatRequired(data.releaseIncludedPages, 'リリースに含めるページ・機能')}`);
  if (data.releaseExcludedPages) {
    lines.push(`今回のリリースに含めないページ・機能：${data.releaseExcludedPages}`);
  }
  lines.push('');

  // H. スケジュール（実装フェーズのみ）
  if (data.phase === 'implementation') {
    lines.push('*H. スケジュール*');
    if (isVisible('designFixDate', data)) {
      lines.push(`デザインFIX日：${formatRequired(data.designFixDate, 'デザインFIX日')}`);
    }
    lines.push(`実装着手OK日：${formatRequired(data.implementationStartDate, '実装着手OK日')}`);
    if (data.internalReviewDeadline) {
      lines.push(`社内確認期限：${data.internalReviewDeadline}`);
    }
    if (data.uatDeadline) {
      lines.push(`UAT/承認期限：${data.uatDeadline}`);
    }
    lines.push(`リリース日：${formatRequired(data.releaseDate, 'リリース日')}`);
    if (data.releaseDateReason) {
      lines.push(`リリース日がマストの場合、その理由：${data.releaseDateReason}`);
    }
    lines.push('');

    // I. 判断・連絡
    lines.push('*I. 判断・連絡*');
    lines.push(`判断責任者：${formatRequired(data.decisionMaker, '判断責任者')}`);
    lines.push(`実装相談先：${formatRequired(data.implementationConsultant, '実装相談先')}`);
    lines.push(`連絡手段：${data.contactMethod}`);
    if (data.emergencyContactPolicy) {
      lines.push(`緊急時の連絡方針：${data.emergencyContactPolicy}`);
    }
    lines.push('');

    // J. 納品後の運用・マニュアル
    lines.push('*J. 納品後の運用・マニュアル*');
    const manualLabels: Record<string, string> = {
      director: 'ディレクター作成',
      implementer: '実装側作成（要調整）',
      later: '次フェーズ',
      tbd: '未定',
    };
    lines.push(`マニュアル作成方針：${manualLabels[data.manualPlan] || data.manualPlan}`);
    if (isVisible('manualScope', data)) {
      lines.push(`作成範囲：${formatRequired(data.manualScope, '作成範囲')}`);
    }
    if (isVisible('manualDeadline', data)) {
      lines.push(`期限：${formatRequired(data.manualDeadline, '期限')}`);
    }
    if (isVisible('scheduleApproval', data)) {
      lines.push(`スケジュール合意の有無：${formatRequired(data.scheduleApproval, 'スケジュール合意の有無')}`);
    }
    lines.push(`更新担当：${data.updateOwner}`);
    lines.push(`操作説明：${data.operationExplanation}`);
    lines.push('');
  }

  // 設計・調査フェーズ用の追加セクション（design時のみ）
  if (data.phase === 'design_survey') {
    // スケジュール（目安）
    if (data.designImplementationStartDate && data.designImplementationStartDate.trim() !== '') {
      lines.push('*スケジュール（目安）*');
      lines.push(`実装着手の希望時期：${data.designImplementationStartDate}`);
      lines.push('※設計内容により前後する可能性があります。');
      lines.push('');
    }

    // 判断・連絡
    if (
      (data.designSpecDecision && data.designSpecDecision.trim() !== '') ||
      (data.designUnclearResponse && data.designUnclearResponse.trim() !== '')
    ) {
      lines.push('*判断・連絡*');
      if (data.designSpecDecision && data.designSpecDecision.trim() !== '') {
        lines.push(`仕様・技術判断：${data.designSpecDecision}`);
      }
      if (data.designUnclearResponse && data.designUnclearResponse.trim() !== '') {
        lines.push(`不明時の対応：${data.designUnclearResponse}`);
      }
      lines.push('');
    }

    // 納品後の運用・マニュアル（想定）
    if (data.designManualPlan && data.designManualPlan.trim() !== '') {
      lines.push('*納品後の運用・マニュアル（想定）*');
      const manualLines = data.designManualPlan.split('\n').filter(line => line.trim() !== '');
      manualLines.forEach(line => {
        lines.push(line.trim());
      });
      lines.push('');
    }
  }

  lines.push(FOOTER_NOTE);

  return '```\n' + lines.join('\n') + '\n```';
}

