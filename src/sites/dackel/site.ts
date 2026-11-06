import type { SiteDefinition } from '../types';

/** Rauhaardackel vom Luchberg (working name, see docs/plan/01-dackel.md). Skeleton until slice 1. */
export const dackel = {
  id: 'dackel',
  name: 'Rauhaardackel vom Luchberg',
  adminLabel: 'Dackel',
  collections: ['dackelPage', 'dackelConfig'],
  redirects: {},
  wranglerConfig: 'src/sites/dackel/wrangler.jsonc',
} as const satisfies SiteDefinition;
