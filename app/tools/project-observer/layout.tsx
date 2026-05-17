import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Project Observer',
  description: '案件の状況共有・認識整理ダッシュボード（POC）',
};

/** このツール領域は常にダークテーマで表示 */
export default function ProjectObserverLayout({ children }: { children: ReactNode }) {
  return <div className="dark">{children}</div>;
}
