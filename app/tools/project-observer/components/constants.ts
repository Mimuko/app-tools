import type {
  CognitiveLoadLevel,
  ConcernComment,
  ContextNote,
  CurrentStateKind,
  NextActionClarity,
  ProceedSafety,
  RiskEventKind,
  ShareStatus,
} from '../types';

export const SHARE_STATUS_CONFIG: Record<
  ShareStatus,
  {
    label: string;
    meaning: string;
    dotClass: string;
    borderClass: string;
    glowClass: string;
  }
> = {
  attention: {
    label: '要注目',
    meaning:
      '未FIX・暫定・要件未確定など。新規未対応は含まない。このまま進めると事故リスクがある可能性',
    dotClass: 'bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.55)]',
    borderClass: 'border-rose-500/40',
    glowClass: 'from-rose-500/10',
  },
  caution: {
    label: '注意',
    meaning:
      '3営業日以上の共有途切れ等により、現在状態が見えづらい（止まっている、ではなく見えない）',
    dotClass: 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]',
    borderClass: 'border-amber-500/40',
    glowClass: 'from-amber-500/8',
  },
  stable: {
    label: '安定',
    meaning:
      '3営業日以内に更新あり、次アクション明記あり、要注目に該当しない — 把握できている',
    dotClass: 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]',
    borderClass: 'border-emerald-500/30',
    glowClass: 'from-emerald-500/5',
  },
};

export const NEXT_ACTION_CONFIG: Record<
  NextActionClarity,
  { label: string; className: string }
> = {
  clear: { label: '明記あり', className: 'text-emerald-700 dark:text-emerald-400/90' },
  partial: { label: '一部のみ', className: 'text-amber-700 dark:text-amber-400/90' },
  unclear: { label: '明記なし', className: 'text-rose-700 dark:text-rose-400/90' },
};

export const PROCEED_SAFETY_CONFIG: Record<
  ProceedSafety,
  { label: string; description: string; className: string }
> = {
  safe: {
    label: '進行してよい',
    description: '認識が揃い、共有が継続している',
    className:
      'border-emerald-500/35 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/20 dark:text-emerald-200',
  },
  careful: {
    label: '慎重に',
    description: '共有・確認を挟んだ方がよい',
    className:
      'border-amber-500/35 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/20 dark:text-amber-200',
  },
  hold: {
    label: '判断待ち',
    description: '要件・認識の整理を優先',
    className:
      'border-rose-500/35 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-950/20 dark:text-rose-200',
  },
};

export const COGNITIVE_LOAD_CONFIG: Record<
  CognitiveLoadLevel,
  { label: string; barClass: string; textClass: string }
> = {
  high: { label: '負荷 高', barClass: 'bg-rose-400', textClass: 'text-rose-700 dark:text-rose-300' },
  elevated: {
    label: '負荷 やや高',
    barClass: 'bg-amber-400',
    textClass: 'text-amber-700 dark:text-amber-300',
  },
  moderate: {
    label: '負荷 中',
    barClass: 'bg-cyan-400',
    textClass: 'text-cyan-700 dark:text-cyan-300',
  },
  light: {
    label: '負荷 低',
    barClass: 'bg-emerald-400',
    textClass: 'text-emerald-700 dark:text-emerald-300',
  },
};

export const CONTEXT_NOTE_CATEGORY: Record<ContextNote['category'], { label: string }> = {
  why_blocked: { label: '止まっている理由' },
  sharing_gap: { label: '共有の不足' },
  alignment: { label: '認識整理' },
};

export const STATE_KIND_STYLES: Record<CurrentStateKind, string> = {
  undecided:
    'border-slate-500/40 bg-slate-100 text-slate-800 dark:bg-slate-500/10 dark:text-slate-300',
  client_pending:
    'border-cyan-500/40 bg-cyan-50 text-cyan-900 dark:bg-cyan-500/10 dark:text-cyan-200',
  provisional:
    'border-violet-500/40 bg-violet-50 text-violet-900 dark:bg-violet-500/10 dark:text-violet-200',
  implementation_risk:
    'border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200',
  ops_concern:
    'border-rose-500/30 bg-rose-50 text-rose-900 dark:bg-rose-500/10 dark:text-rose-200',
};

export const SIGNAL_LABELS: Record<ConcernComment['signal'], string> = {
  provisional: '暫定',
  unfixed: '未FIX',
  ops: '運用',
  pending_reply: '返答待ち',
};

export const RISK_KIND_CONFIG: Record<
  RiskEventKind,
  { label: string; markerClass: string }
> = {
  spec_change: { label: '仕様変更', markerClass: 'bg-cyan-400' },
  rework: { label: '差し戻し', markerClass: 'bg-amber-400' },
  provisional_fix: { label: '暫定対応', markerClass: 'bg-violet-400' },
};
