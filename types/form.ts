// D. デザインの関与範囲（実装フェーズ用）
export type DesignRole = 'design_creation' | 'existing_tone' | 'spec_fixed';

// D. デザインの関与方針（設計・調査フェーズ用）
export type DesignInvolvementPolicy = 'design_judgment_needed' | 'existing_tone_judgment' | 'no_design_judgment';

export type ExceptionAllowed =
  | '色'
  | 'フォント'
  | '装飾'
  | '画像比率'
  | '細かい余白'
  | 'hover等';

export type ImplementationPriority =
  | 'レイアウト'
  | '幅'
  | '画像サイズ感'
  | '見出しサイズ'
  | 'カラー'
  | 'フォント'
  | '装飾';

export type ReferenceLevel = 'カラー' | '英字フォント' | '背景' | '装飾';

// E. コンテンツの静的/動的方針
export type ContentRendering = 'static_ok' | 'dynamic_required' | 'dynamic_later' | 'undecided';

export type DataOwner = 'クライアント' | '社内' | '未定';

export type FutureDynamicPossible = 'あり' | 'なし' | '未定';

// C. 制約
export type ConstraintStatus = 'known' | 'partial' | 'unknown';

// F. 実装方針
export type ImplementationPolicy = 'A' | 'B' | 'MIX' | 'TBD';

// J. 納品後の運用・マニュアル
export type ManualPlan = 'director' | 'implementer' | 'later' | 'tbd';

export type ContactMethod = 'Slack' | 'Backlog' | 'メール';

// D. デザインの役割 - 差分判断者
export type ExceptionDecisionOwner = 'ディレクター（一次判断）' | 'クライアント（ディレクター経由で確認）' | '未定（※着手前に確定必須）';

// B. 環境・前提
export type CMS = 'HubSpot' | 'WordPress' | 'その他';

export type ExistingModulePolicy = '既存優先' | '新規あり' | '未定';

// C. 制約・方針
export type DifficultAreaPolicy = '近似' | '後回し' | 'スコープ外' | '相談して決めたい';

// J. 納品後の運用・マニュアル
export type OperationExplanation = 'リリース時資料納品' | 'オンライン説明' | '次フェーズ';

// フェーズ選択
export type Phase = 'design_survey' | 'implementation';

// 要件確定チェック
export type RequirementConfirmed = 'confirmed' | 'not_confirmed';

// J. 納品後の運用・マニュアル
export type ScheduleApproval = 'agreed' | 'not_agreed';

export interface FormData {
  // フェーズ選択
  phase: Phase;
  
  // 要件確定チェック（実装フェーズのみ）
  requirementConfirmed?: RequirementConfirmed;
  requirementDocumentUrl?: string; // 要件確定チェック=yesの場合必須
  requirementDocumentVersion?: string; // 任意
  // A. 案件概要
  projectName: string;
  purposeKPI: string;
  targetScope: string;
  excludedScope?: string;

  // B. 環境・前提
  cms: CMS;
  theme?: string;
  existingModulePolicy: ExistingModulePolicy;
  touchableRange?: string;
  untouchableRange?: string;

  // C. 制約・方針
  constraintStatus: ConstraintStatus;
  constraintContent?: string;
  constraintNextAction?: string; // unknown時必須
  difficultAreaPolicy: DifficultAreaPolicy;

  // D. デザインの関与範囲
  designRole: DesignRole;
  // existing_toneの場合
  existingDesignReference?: string; // 既存デザインの参照元
  // design_creationの場合（旧wf/tone相当）
  implementationPriority?: ImplementationPriority[];
  referenceLevel?: ReferenceLevel[];
  // spec_fixedの場合（旧spec相当）
  exceptionAllowed?: ExceptionAllowed[];
  exceptionNote?: string;
  exceptionDecisionOwner?: ExceptionDecisionOwner;
  // 共通（design_creation, existing_toneの場合）
  figmaBaseFrameUrl?: string; // design_creation, existing_toneの場合のみ必須
  figmaReferenceFrameUrl?: string;
  baseFrameNote?: string;

  // E. コンテンツの静的/動的方針
  contentRendering: ContentRendering;
  // dynamic_required or dynamic_later の場合
  dataSourceSpec?: string;
  dataOwner?: DataOwner;
  displayRule?: string;
  dynamicLaterTiming?: string; // dynamic_later時のみ
  // static_ok or undecided の場合
  futureDynamicPossible?: FutureDynamicPossible;
  futureDynamicCondition?: string; // futureDynamicPossible=ありの場合必須

  // 要件確定チェック（Fの前に挿入）
  // requirementConfirmed, requirementDocumentUrl, requirementDocumentVersion は上で定義済み

  // F. 実装方針（A/B）
  implementationPolicy: ImplementationPolicy;
  adminChangeableRange?: string; // A/MIXの場合
  fixedTargets?: string; // B/MIXの場合必須
  clientNonEditableNote?: string; // B/MIXの場合必須
  acceptanceCriteria: string;

  // G. 今回のリリース範囲・優先順位
  releaseIncludedPages: string; // 必須
  releaseExcludedPages?: string; // 任意

  // H. スケジュール
  designFixDate: string;
  implementationStartDate: string;
  internalReviewDeadline?: string;
  uatDeadline?: string;
  releaseDate: string;
  releaseDateReason?: string;

  // I. 判断・連絡
  decisionMaker: string;
  implementationConsultant: string;
  contactMethod: ContactMethod;
  emergencyContactPolicy?: string;

  // J. 納品後の運用・マニュアル
  manualPlan: ManualPlan;
  manualScope?: string; // implementer時必須
  manualDeadline?: string; // implementer時必須
  scheduleApproval?: ScheduleApproval; // implementer時必須
  updateOwner: DataOwner;
  operationExplanation: OperationExplanation;

  // 設計・調査フェーズ用（design_survey時のみ使用）
  designInvolvementPolicy?: DesignInvolvementPolicy; // デザインの関与方針（検討）
  designJudgmentReference?: string; // 参考情報（任意）
  designImplementationStartDate?: string; // 実装着手の希望時期
  designSpecDecision?: string; // 仕様・技術判断
  designUnclearResponse?: string; // 不明時の対応
  designManualPlan?: string; // 納品後の運用・マニュアル（想定）
}

export interface ValidationErrors {
  [key: string]: boolean | undefined;
}
