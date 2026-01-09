import type { FormData } from '@/types/form';

/**
 * フィールドが表示されるべきかどうかを判定
 */
export function isVisible(fieldKey: keyof FormData, data: FormData): boolean {
  switch (fieldKey) {
    // D. デザインの関与範囲 - spec_fixedの場合（設計・調査フェーズのみ）
    case 'exceptionAllowed':
    case 'exceptionNote':
    case 'exceptionDecisionOwner':
      return data.designRole === 'spec_fixed' && data.phase === 'design_survey';

    // D. デザインの関与範囲 - design_creationの場合
    case 'implementationPriority':
    case 'referenceLevel':
      return data.designRole === 'design_creation';

    // D. デザインの関与範囲 - existing_toneの場合
    case 'existingDesignReference':
      return data.designRole === 'existing_tone';

    // D. デザインの関与範囲 - design_creationの場合のみ
    case 'figmaBaseFrameUrl':
    case 'figmaReferenceFrameUrl':
    case 'baseFrameNote':
      return data.designRole === 'design_creation';

    // H. スケジュール - デザインFIX日はデザイン作成ありの場合のみ
    case 'designFixDate':
      return data.designRole === 'design_creation';

    // E. コンテンツ - dynamic_required or dynamic_later の場合
    case 'dataSourceSpec':
    case 'dataOwner':
      return (
        data.contentRendering === 'dynamic_required' ||
        data.contentRendering === 'dynamic_later'
      );
    // E. 表示条件 - 実装フェーズの場合は要件確定チェック=Yesの場合のみ、設計・調査フェーズの場合は従来通り
    case 'displayRule':
      if (data.phase === 'implementation') {
        return (
          data.requirementConfirmed === 'confirmed' &&
          (data.contentRendering === 'dynamic_required' ||
            data.contentRendering === 'dynamic_later')
        );
      }
      // 設計・調査フェーズの場合は従来通り
      return (
        data.contentRendering === 'dynamic_required' ||
        data.contentRendering === 'dynamic_later'
      );
    case 'dynamicLaterTiming':
      return data.contentRendering === 'dynamic_later';

    // E. コンテンツ - static_ok or undecided の場合
    case 'futureDynamicPossible':
    case 'futureDynamicCondition':
      return (
        data.contentRendering === 'static_ok' ||
        data.contentRendering === 'undecided'
      );

    // C. 制約 - unknown の場合
    case 'constraintNextAction':
      return data.constraintStatus === 'unknown';

    // F. 実装方針 - A/MIXの場合
    case 'adminChangeableRange':
      return data.implementationPolicy === 'A' || data.implementationPolicy === 'MIX';

    // F. 実装方針 - B/MIXの場合
    case 'fixedTargets':
    case 'clientNonEditableNote':
      return data.implementationPolicy === 'B' || data.implementationPolicy === 'MIX';

    // J. マニュアル - implementer の場合
    case 'manualScope':
    case 'manualDeadline':
    case 'scheduleApproval':
      return data.manualPlan === 'implementer';

    // 要件確定チェック関連 - 実装フェーズで要件確定チェック=Yesの場合
    case 'requirementDocumentUrl':
    case 'requirementDocumentVersion':
      return data.phase === 'implementation' && data.requirementConfirmed === 'confirmed';

    // B. 環境・前提 - 既存モジュール利用方針はHubSpotの場合のみ
    case 'existingModulePolicy':
      return data.cms === 'HubSpot';

    // B. 環境・前提 - 使用テーマ名は「その他」以外の場合のみ表示
    case 'theme':
      return data.cms !== 'その他';

    // 設計・調査フェーズ用 - デザインの関与方針の参考情報
    case 'designJudgmentReference':
      return (
        data.phase === 'design_survey' &&
        (data.designInvolvementPolicy === 'design_judgment_needed' ||
          data.designInvolvementPolicy === 'existing_tone_judgment')
      );

    default:
      return true;
  }
}

/**
 * 現在表示されている必須項目のリストを取得
 */
export function getRequiredFields(data: FormData): (keyof FormData)[] {
  const required: (keyof FormData)[] = [
    'projectName',
    'purposeKPI',
    'targetScope',
    'cms',
    'constraintStatus',
    'difficultAreaPolicy',
    'contentRendering',
    'implementationPolicy',
    'acceptanceCriteria',
    'releaseIncludedPages',
    'updateOwner',
    'operationExplanation',
  ];

  // フェーズ別の必須項目
  if (data.phase === 'design_survey') {
    required.push('designInvolvementPolicy');
  } else {
    required.push('designRole', 'implementationStartDate', 'releaseDate', 'decisionMaker', 'implementationConsultant', 'contactMethod', 'manualPlan');
  }

  // HubSpotの場合のみ既存モジュール利用方針を必須に
  if (data.cms === 'HubSpot') {
    required.push('existingModulePolicy');
  }

  // 条件に応じて追加の必須項目
  if (data.phase === 'implementation') {
    if (data.designRole === 'spec_fixed') {
      // 実装フェーズでは spec_fixed の場合の必須項目は表示されない（非表示のため必須チェック不要）
    } else if (data.designRole === 'design_creation') {
      required.push('implementationPriority', 'figmaBaseFrameUrl', 'designFixDate');
    }
  }
  // existing_toneの場合はFigma関連フィールドは不要

  if (
    data.contentRendering === 'dynamic_required' ||
    data.contentRendering === 'dynamic_later'
  ) {
    required.push('dataSourceSpec', 'dataOwner');
    // displayRuleは任意（補足情報として扱う）
  } else if (
    data.contentRendering === 'static_ok' ||
    data.contentRendering === 'undecided'
  ) {
    required.push('futureDynamicPossible');
    if (data.futureDynamicPossible === 'あり') {
      required.push('futureDynamicCondition');
    }
  }

  if (data.constraintStatus === 'unknown') {
    required.push('constraintNextAction');
  }

  if (
    data.implementationPolicy === 'B' ||
    data.implementationPolicy === 'MIX'
  ) {
    required.push('fixedTargets', 'clientNonEditableNote');
  }

  if (data.manualPlan === 'implementer') {
    required.push('manualScope', 'manualDeadline', 'scheduleApproval');
  }

  // 実装フェーズで要件確定チェック=Yesの場合、要件定義URLを必須に
  if (data.phase === 'implementation' && data.requirementConfirmed === 'confirmed') {
    required.push('requirementDocumentUrl');
  }

  // 表示されていない項目は必須から除外
  return required.filter((field) => isVisible(field, data));
}

/**
 * 警告を表示すべき条件を判定
 */
export function shouldShowWarning(data: FormData): {
  constraintUnknown: boolean;
  implementationTBD: boolean;
  manualTBD: boolean;
  contentUndecided: boolean;
} {
  return {
    constraintUnknown: data.constraintStatus === 'unknown',
    implementationTBD: data.implementationPolicy === 'TBD',
    manualTBD: data.manualPlan === 'tbd',
    contentUndecided: data.contentRendering === 'undecided',
  };
}

