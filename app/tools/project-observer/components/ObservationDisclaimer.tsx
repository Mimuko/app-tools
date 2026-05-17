export function ObservationDisclaimer() {
  return (
    <p
      className="mb-6 rounded-md border px-4 py-3 text-sm leading-relaxed obs-text-muted"
      style={{
        borderColor: 'var(--obs-disclaimer-border)',
        backgroundColor: 'var(--obs-disclaimer-bg)',
      }}
    >
      <strong className="font-medium obs-text-secondary">Backlogが正式情報</strong>
      です。本ツールは状態整理・リスク観測・認知負荷の可視化のみを行う補助レイヤーであり、
      判定はルールベースの観測結果です（管理責任はBacklog側）。
    </p>
  );
}
