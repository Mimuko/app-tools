export type TechStack = 'hubspot' | 'wordpress' | 'static' | 'other-cms';
export type ProjectType = 'new' | 'renewal';

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface ChecklistCategory {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface ChecklistSection {
  id: string;
  title: string;
  categories?: ChecklistCategory[]; // カテゴリーがある場合
  items?: ChecklistItem[]; // カテゴリーがない場合（直接項目）
  collapsed?: boolean;
}

export interface ChecklistData {
  sections: ChecklistSection[];
}
