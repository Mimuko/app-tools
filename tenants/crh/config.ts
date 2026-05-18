import { SHARED_OBSERVATION_DEFAULTS } from '../_shared/observation-defaults';

/**
 * CRH テナント — Netlify CRH サイト（Private）用
 */
export const OBSERVATION_CONFIG = {
  ...SHARED_OBSERVATION_DEFAULTS,
  backlogSpaceLabel: 'CRH Backlogスペース',
} as const;

/** 負荷集計対象: ディレクターチーム（Backlog 表示名） */
export const DIRECTOR_TEAM: readonly {
  id: string;
  backlogName: string;
}[] = [
  { id: 'nakaya', backlogName: 'CRH_中谷信明' },
  { id: 'nakano', backlogName: 'CRH_中野 絵理子' },
  { id: 'masui', backlogName: 'CRH_増位' },
  { id: 'urabe', backlogName: 'CRH_浦辺良亮' },
  { id: 'kuge', backlogName: '久下 しおり' },
  { id: 'kosugi', backlogName: '小杉 慶来' },
] as const;
