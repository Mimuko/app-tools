'use client';

import { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  children: ReactNode;
  hasError?: boolean;
}

export function FormSection({ title, children, hasError }: FormSectionProps) {
  return (
    <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        {hasError && <span className="text-red-500 dark:text-red-400 mr-2">⚠ 未入力あり</span>}
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

