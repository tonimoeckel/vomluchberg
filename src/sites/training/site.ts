import type { SiteDefinition } from '../types';

/** Alltag kann Sport – Hundetraining Karolin Riesing (see docs/plan/02-training.md). Skeleton until slice 2. */
export const training = {
  id: 'training',
  name: 'Alltag kann Sport',
  adminLabel: 'Training',
  collections: ['trainingPage', 'trainingConfig'],
  redirects: {},
  wranglerConfig: 'src/sites/training/wrangler.jsonc',
} as const satisfies SiteDefinition;
