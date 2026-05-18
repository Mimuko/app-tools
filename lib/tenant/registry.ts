import * as crh from '@/tenants/crh/config';
import * as generic from '@/tenants/generic/config';

const TENANTS = {
  crh,
  generic,
} as const;

export type TenantId = keyof typeof TENANTS;

const TENANT_IDS = Object.keys(TENANTS) as TenantId[];

export function getTenantId(): TenantId {
  const raw = process.env.TENANT_ID?.trim() || 'crh';
  if (!TENANT_IDS.includes(raw as TenantId)) {
    throw new Error(
      `Unknown TENANT_ID="${raw}". Valid values: ${TENANT_IDS.join(', ')}`,
    );
  }
  return raw as TenantId;
}

export function getTenantModule() {
  return TENANTS[getTenantId()];
}
