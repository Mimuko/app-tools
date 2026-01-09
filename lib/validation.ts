import type { FormData, ValidationErrors } from '@/types/form';
import { getRequiredFields, isVisible } from './visibility';

function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateForm(data: FormData): ValidationErrors {
  const errors: ValidationErrors = {};
  const requiredFields = getRequiredFields(data);

  for (const field of requiredFields) {
    if (!isVisible(field, data)) {
      continue; // 非表示の項目はチェックしない
    }

    const value = data[field];

    // 配列の場合は長さをチェック
    if (Array.isArray(value)) {
      if (value.length === 0) {
        errors[field] = true;
      }
    }
    // 文字列の場合は空文字/空白のみをチェック
    else if (typeof value === 'string') {
      if (!value || value.trim() === '') {
        errors[field] = true;
      }
      // URLフィールドの場合は形式チェック
      else if (field === 'figmaBaseFrameUrl' || field === 'figmaReferenceFrameUrl' || field === 'requirementDocumentUrl') {
        if (!isValidUrl(value.trim())) {
          errors[field] = true;
        }
      }
    }
    // undefinedの場合はエラー
    else if (value === undefined || value === null) {
      errors[field] = true;
    }
  }

  // 参考フレームURLは任意だが、入力されている場合は形式チェック
  if (data.figmaReferenceFrameUrl && data.figmaReferenceFrameUrl.trim() !== '') {
    if (!isValidUrl(data.figmaReferenceFrameUrl.trim())) {
      errors.figmaReferenceFrameUrl = true;
    }
  }

  return errors;
}

export function getInitialFormData(): FormData {
  return {
    phase: 'implementation', // デフォルトは実装フェーズ
    requirementConfirmed: undefined,
    requirementDocumentUrl: '',
    requirementDocumentVersion: '',
    projectName: '',
    purposeKPI: '',
    targetScope: '',
    excludedScope: '',
    cms: 'HubSpot',
    theme: '',
    existingModulePolicy: '既存優先',
    touchableRange: '',
    untouchableRange: '',
    constraintStatus: 'partial',
    constraintContent: '',
    constraintNextAction: '',
    difficultAreaPolicy: '相談して決めたい',
    designRole: 'design_creation',
    existingDesignReference: '',
    implementationPriority: [],
    referenceLevel: [],
    exceptionAllowed: [],
    exceptionNote: '',
    exceptionDecisionOwner: undefined,
    figmaBaseFrameUrl: '',
    figmaReferenceFrameUrl: '',
    baseFrameNote: '',
    contentRendering: 'static_ok',
    dataSourceSpec: '',
    dataOwner: '未定',
    displayRule: '',
    dynamicLaterTiming: '',
    futureDynamicPossible: '未定',
    futureDynamicCondition: '',
    implementationPolicy: 'TBD',
    adminChangeableRange: '',
    fixedTargets: '',
    clientNonEditableNote: '',
    acceptanceCriteria: '',
    releaseIncludedPages: '',
    releaseExcludedPages: '',
    designFixDate: '',
    implementationStartDate: '',
    internalReviewDeadline: '',
    uatDeadline: '',
    releaseDate: '',
    releaseDateReason: '',
    decisionMaker: '',
    implementationConsultant: '増位',
    contactMethod: 'Slack',
    emergencyContactPolicy: '',
    manualPlan: 'later',
    manualScope: '',
    manualDeadline: '',
    scheduleApproval: undefined,
    updateOwner: '未定',
    operationExplanation: 'リリース時資料納品',
    // 設計・調査フェーズ用
    designInvolvementPolicy: undefined,
    designJudgmentReference: '',
    designImplementationStartDate: '',
    designSpecDecision: '',
    designUnclearResponse: '',
    designManualPlan: '',
  };
}
