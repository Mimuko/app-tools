import { ChecklistItem, TechStack, ProjectType } from '../types';

// 基本項目（常に表示）
const basicItems: ChecklistItem[] = [
  { id: 'basic-display-1', text: 'SP表示で致命的なレイアウト崩れがない', checked: false },
  { id: 'basic-display-2', text: 'テキストが読めない／被っている箇所がない', checked: false },
  { id: 'basic-link-1', text: '主要リンク・ボタンが機能している', checked: false },
  { id: 'basic-link-2', text: '想定したユーザー導線が途切れていない', checked: false },
  { id: 'basic-public-1', text: '本番URLで表示されている', checked: false },
  { id: 'basic-public-2', text: 'noindex / 認証制限が残っていない', checked: false },
  { id: 'basic-form', text: 'フォーム送信・完了導線が成立している（存在する場合）', checked: false },
  { id: 'basic-analytics', text: '必要な計測タグが発火している（目的がある場合）', checked: false },
];

// リニューアル時の追加項目
const renewalItems: ChecklistItem[] = [
  { id: 'renewal-1', text: '旧URL → 新URL のリダイレクト確認（主要ページのみ）', checked: false },
  { id: 'renewal-2', text: 'noindex 設定が引き継がれていない', checked: false },
  { id: 'renewal-3', text: 'sitemap / Search Console 対応状況を把握している', checked: false },
];

// 技術スタック別の追加項目
const hubspotItems: ChecklistItem[] = [
  { id: 'hubspot-1', text: 'モジュール制約による表示差分がない', checked: false },
  { id: 'hubspot-2', text: 'HubL 条件分岐の想定外表示がない', checked: false },
  { id: 'hubspot-3', text: 'スマートルールが意図せず効いていない', checked: false },
  { id: 'hubspot-4', text: 'フォーム／ワークフロー連携の確認（存在する場合）', checked: false },
];

const wordpressItems: ChecklistItem[] = [
  { id: 'wp-1', text: 'キャッシュの影響で更新が反映されていない箇所がない', checked: false },
  { id: 'wp-2', text: 'プラグイン由来の表示崩れが出ていない', checked: false },
  { id: 'wp-3', text: 'カスタム投稿／ACFが想定通り表示されている', checked: false },
  { id: 'wp-4', text: '管理画面設定（公開状態・パーマリンク）の確認', checked: false },
];

const staticSiteItems: ChecklistItem[] = [
  { id: 'static-1', text: 'パス・リンク切れが発生していない', checked: false },
  { id: 'static-2', text: 'OGP / favicon が本番環境で正しく反映されている', checked: false },
  { id: 'static-3', text: 'ビルド・デプロイ漏れがない', checked: false },
  { id: 'static-4', text: 'ステージングとの差分が想定内か', checked: false },
];

const otherCmsItems: ChecklistItem[] = [
  { id: 'other-1', text: 'CMS固有の公開フロー（下書き／承認）が完了している', checked: false },
  { id: 'other-2', text: '本番と編集画面で表示差分がない', checked: false },
];

// 公開後確認項目
const postReleaseItems: ChecklistItem[] = [
  { id: 'post-1', text: '計測が実際に取得できているか', checked: false },
  { id: 'post-2', text: '広告流入後の挙動に想定外がないか', checked: false },
  { id: 'post-3', text: 'Search Console のエラー有無', checked: false },
  { id: 'post-4', text: 'リダイレクトの実測確認', checked: false },
  { id: 'post-5', text: 'キャッシュ・CDN影響の確認', checked: false },
];

import { ChecklistCategory } from '../types';

export function getChecklistData(
  techStack: TechStack | null,
  projectType: ProjectType | null
): { sections: Array<{ id: string; title: string; categories?: ChecklistCategory[]; items?: ChecklistItem[]; collapsed?: boolean }> } {
  const sections: Array<{ id: string; title: string; categories?: ChecklistCategory[]; items?: ChecklistItem[]; collapsed?: boolean }> = [];

  // セクション①：常に表示（公開前に確認すること）
  const categories: ChecklistCategory[] = [];
  
  // 基本項目のカテゴリー（常に表示）
  categories.push({
    id: 'basic-display',
    title: '表示・可読性',
    items: basicItems.filter(item => item.id.startsWith('basic-display')).map(item => ({ ...item })),
  });
  
  categories.push({
    id: 'basic-link',
    title: '導線・リンク',
    items: basicItems.filter(item => item.id.startsWith('basic-link')).map(item => ({ ...item })),
  });
  
  categories.push({
    id: 'basic-public',
    title: '公開状態',
    items: basicItems.filter(item => item.id.startsWith('basic-public')).map(item => ({ ...item })),
  });
  
  categories.push({
    id: 'basic-form',
    title: '成果点（存在する場合）',
    items: basicItems.filter(item => item.id === 'basic-form').map(item => ({ ...item })),
  });
  
  categories.push({
    id: 'basic-analytics',
    title: '最低限の計測（目的がある場合）',
    items: basicItems.filter(item => item.id === 'basic-analytics').map(item => ({ ...item })),
  });
  
  // リニューアル時の追加カテゴリー
  if (projectType === 'renewal') {
    categories.push({
      id: 'renewal',
      title: 'リニューアルの場合に追加で確認すること',
      items: renewalItems.map(item => ({ ...item })),
    });
  }
  
  // 技術スタック別の追加カテゴリー
  if (techStack !== null) {
    switch (techStack) {
      case 'hubspot':
        categories.push({
          id: 'hubspot',
          title: 'HubSpot環境で起きやすい確認ポイント',
          items: hubspotItems.map(item => ({ ...item })),
        });
        break;
      case 'wordpress':
        categories.push({
          id: 'wordpress',
          title: 'WordPress環境で起きやすい確認ポイント',
          items: wordpressItems.map(item => ({ ...item })),
        });
        break;
      case 'static':
        categories.push({
          id: 'static',
          title: '静的サイトで起きやすい確認ポイント',
          items: staticSiteItems.map(item => ({ ...item })),
        });
        break;
      case 'other-cms':
        categories.push({
          id: 'other-cms',
          title: 'その他CMSでの確認ポイント',
          items: otherCmsItems.map(item => ({ ...item })),
        });
        break;
    }
  }
  
  // セクション①を追加（常に表示）
  sections.push({
    id: 'pre-release',
    title: '公開前に確認すること（最低限）',
    categories: categories,
    collapsed: false,
  });

  // セクション②：公開後確認（折りたたみ、条件が揃ったら表示）
  if (techStack !== null || projectType !== null) {
    sections.push({
      id: 'post-release',
      title: '公開後に念のため確認すること',
      items: postReleaseItems.map(item => ({ ...item })),
      collapsed: true, // 初期状態で折りたたみ
    });
  }

  return { sections };
}
