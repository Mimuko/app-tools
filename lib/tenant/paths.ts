import path from 'path';
import { getTenantId } from './registry';

export function getTenantRootPath(): string {
  return path.join(process.cwd(), 'tenants', getTenantId());
}

export function getTenantSnapshotPath(): string {
  return path.join(getTenantRootPath(), 'data', 'snapshot.json');
}
