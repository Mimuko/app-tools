import Link from 'next/link';

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            ツール一覧
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            利用可能なツールを選択してください
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Link
            href="/tools/request"
            className="block bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md hover:shadow-lg transition-all border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              実装依頼生成ツール
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              依頼整理から原因確認・修正依頼文を生成します（状態分岐・判断フロー統合）
            </p>
            <div className="text-primary-600 dark:text-primary-400 font-medium">
              利用する →
            </div>
          </Link>

          <Link
            href="/tools/qa"
            className="block bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md hover:shadow-lg transition-all border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              公開前確認チェックリスト
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              公開可否を判断するための最低限の確認項目を条件に応じて表示します
            </p>
            <div className="text-primary-600 dark:text-primary-400 font-medium">
              利用する →
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
