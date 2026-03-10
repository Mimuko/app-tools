/**
 * 依頼タイプ別フォーム（要件整理・制作進行）の型定義とフィールド定義
 * 既存の原因確認・修正依頼フローとは別に、依頼整理ツールとして追加
 */

export type RequestType = 'requirement' | 'production' | 'legacy';

export type ClientNegotiationOption = 'yes' | 'no';

export interface RequestTypeFormValues {
  // 共通
  project_name: string;
  target_url: string;
  summary: string;
  background: string;
  deadline: string;
  priority: string;
  stakeholders: string;
  // 要件整理 / 要件定義
  include_client_negotiation: ClientNegotiationOption;
  current_state: string;
  desired_state: string;
  change_reason: string;
  undecided_items: string;
  impact_scope: string;
  client_confirmation: string;
  // 制作進行
  fixed_spec: string;
  design_spec_url: string;
  implementation_content: string;
  production_company: string;
  confirmation_flow: string;
  release_wish_date: string;
}

export const REQUEST_TYPE_OPTIONS: { value: RequestType; label: string }[] = [
  { value: 'requirement', label: '相談しながら進めたい（仕様未確定）' },
  { value: 'production', label: '実装 / 制作進行をお願いしたい（仕様あり）' },
  { value: 'legacy', label: '不具合の調査・表示修正/実装をお願いしたい' },
];

export const CLIENT_NEGOTIATION_OPTIONS: { value: ClientNegotiationOption; label: string }[] = [
  { value: 'yes', label: 'クライアント折衝を含む' },
  { value: 'no', label: 'クライアント折衝は含まない' },
];

export const initialRequestTypeFormValues: RequestTypeFormValues = {
  project_name: '',
  target_url: '',
  summary: '',
  background: '',
  deadline: '',
  priority: '',
  stakeholders: '',
  include_client_negotiation: 'yes',
  current_state: '',
  desired_state: '',
  change_reason: '',
  undecided_items: '',
  impact_scope: '',
  client_confirmation: '',
  fixed_spec: '',
  design_spec_url: '',
  implementation_content: '',
  production_company: '',
  confirmation_flow: '',
  release_wish_date: '',
};

type FieldDef = {
  id: keyof RequestTypeFormValues;
  label: string;
  inputType: 'text' | 'textarea';
  helpText?: string;
  placeholder?: string;
};

/** 要件整理・制作進行フォームの必須項目 */
export const REQUIRED_FIELD_IDS: (keyof RequestTypeFormValues)[] = [
  'project_name',
  'target_url',
  'summary',
  'deadline',
];

/** 必須項目のラベル（バリデーションエラー表示用） */
export const REQUIRED_FIELD_LABELS: Record<string, string> = {
  project_name: '案件名',
  target_url: '対象（URL / ページ / 機能）',
  summary: '依頼内容',
  deadline: '期限',
};

/** 要件整理・制作進行フォームのバリデーション */
export function validateRequestTypeForm(
  values: RequestTypeFormValues
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  for (const id of REQUIRED_FIELD_IDS) {
    const v = values[id];
    if (v == null || String(v).trim() === '') {
      missing.push(REQUIRED_FIELD_LABELS[id] ?? id);
    }
  }
  return { valid: missing.length === 0, missing };
}

/** 共通フィールド（依頼タイプに関係なく表示） */
export const COMMON_FIELDS: FieldDef[] = [
  { id: 'project_name', label: '案件名', inputType: 'text', placeholder: '例：〇〇サイトリニューアル', helpText: 'わかる範囲でOKです' },
  { id: 'target_url', label: '対象（URL / ページ / 機能）', inputType: 'text', placeholder: '例：https://example.com/page', helpText: '該当するページや画面があれば' },
  { id: 'summary', label: '依頼内容（簡単でOK）', inputType: 'textarea', placeholder: '一言でいうと、何をしたいですか？\n例：LPのCTAを資料DL → 問い合わせに変更したい', helpText: '箇条書きでも、思いつくまま書いて大丈夫です' },
  { id: 'background', label: '背景 / 目的', inputType: 'textarea', placeholder: 'なぜこの依頼をしたいのか、背景があれば', helpText: '空欄でも可' },
  { id: 'deadline', label: '期限', inputType: 'text', placeholder: '例：3月末、〇月〇日まで', helpText: '決まっていなければ「未定」と入力してください' },
  { id: 'priority', label: '優先度', inputType: 'text', placeholder: '例：高 / 中 / 低、急ぎ', helpText: '感覚で大丈夫です' },
  { id: 'stakeholders', label: '関係者', inputType: 'text', placeholder: '例：〇〇担当、クライアント名', helpText: '分かる人を書いてください' },
];

/** 要件整理 / 要件定義 用フィールド */
export const REQUIREMENT_FIELDS: FieldDef[] = [
  { id: 'current_state', label: '今の状況（わかる範囲で）', inputType: 'textarea', placeholder: '例：\n・CTAが資料DLになっている\n・HubSpotで変更できるか不明', helpText: 'ざっくりで大丈夫です' },
  { id: 'change_reason', label: '変更理由（わかれば）', inputType: 'textarea', placeholder: 'なぜ変えたいのか、きっかけがあれば', helpText: '空欄でも可' },
  { id: 'undecided_items', label: '未確定事項', inputType: 'textarea', placeholder: 'まだ決まっていないこと（あれば）', helpText: '「なし」や空欄でもOK' },
  { id: 'impact_scope', label: '影響範囲', inputType: 'textarea', placeholder: '他に影響しそうなページ・機能があれば', helpText: '分かる範囲で' },
  { id: 'client_confirmation', label: 'クライアント確認が必要なこと', inputType: 'textarea', placeholder: 'クライアントに確認・判断してもらいたいこと', helpText: '「なし」や空欄でも可' },
];

/** 制作進行 用フィールド */
export const PRODUCTION_FIELDS: FieldDef[] = [
  { id: 'fixed_spec', label: '確定済み仕様', inputType: 'textarea', placeholder: '例：\nCTAリンク\n資料DL → 問い合わせ', helpText: '決まっている仕様や変更内容' },
  { id: 'design_spec_url', label: 'デザイン / 仕様資料URL（Figmaなど）', inputType: 'text', placeholder: '例：https://figma.com/file/...', helpText: 'あれば貼ってください' },
  { id: 'implementation_content', label: '実装内容', inputType: 'textarea', placeholder: '何を実装してほしいか、箇条書きで', helpText: '思いつく範囲で大丈夫です' },
  { id: 'production_company', label: '担当制作会社', inputType: 'text', placeholder: '例：〇〇制作、自社', helpText: '分かる範囲で' },
  { id: 'confirmation_flow', label: '確認フロー', inputType: 'textarea', placeholder: '誰がいつ確認するか、フローがあれば', helpText: '空欄でも可' },
  { id: 'release_wish_date', label: 'リリース希望日', inputType: 'text', placeholder: '例：〇月〇日、〇月末', helpText: '決まっていなければ「未定」でOK' },
];
