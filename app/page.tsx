'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // 現在のパスを基準に相対パスでリダイレクト
    // サブディレクトリに配置されている場合でも正しく動作
    const basePath = pathname === '/' ? '' : pathname.replace(/\/$/, '');
    router.replace(`${basePath}/tools/`);
  }, [router, pathname]);

  return null;
}
