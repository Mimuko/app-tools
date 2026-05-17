export function ObservationDisclaimer() {
  return (
    <p className="mb-6 rounded-md border border-slate-800/60 bg-slate-900/30 px-4 py-3 text-xs leading-relaxed text-slate-500">
      <strong className="font-normal text-slate-400">Backlogが正式情報</strong>
      です。本ツールは状態整理・リスク観測・認知負荷の可視化のみを行う補助レイヤーであり、
      判定はルールベースの観測結果です（管理責任はBacklog側）。
    </p>
  );
}
