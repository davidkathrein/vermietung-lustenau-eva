import type { GlobalConfig } from 'payload'

import { adminOnly } from '../access/adminOnly'

export const InstagramSyncStatus: GlobalConfig = {
  slug: 'instagram-sync-status',
  label: { de: 'Instagram-Abgleich', en: 'Instagram sync' },
  admin: { hidden: true },
  access: { read: adminOnly, update: adminOnly },
  fields: [
    { name: 'snapshotId', type: 'text' },
    { name: 'startedAt', type: 'date' },
    { name: 'completedAt', type: 'date' },
    { name: 'profileUrl', type: 'text' },
    { name: 'lastError', type: 'text' },
    { name: 'lastImportedCount', type: 'number' },
  ],
}
