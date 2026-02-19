'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 判断・依頼整理は実装依頼生成ツール（/tools/request）に統合済みです。
 * 旧URLのため /tools/request へリダイレクトします。
 */
export default function JudgmentRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/tools/request');
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <p className="text-gray-600 dark:text-gray-400">実装依頼生成ツールへ移動しています…</p>
    </main>
  );
}
