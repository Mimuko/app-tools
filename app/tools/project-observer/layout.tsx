import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './observer.css';

export const metadata: Metadata = {
  title: '朝会支援UI',
  description: '朝会向け — 状況共有・認識同期・負荷の可視化',
};

export default function ProjectObserverLayout({ children }: { children: ReactNode }) {
  return children;
}
