import type { SiteDefinition } from '../types';

/** Rauhaardackel vom Luchberg (working name, see docs/plan/01-dackel.md). */
export const dackel = {
  id: 'dackel',
  name: 'Rauhaardackel vom Luchberg',
  adminLabel: 'Dackel',
  collections: ['dackelPage', 'dackelHund', 'dackelWurf', 'dackelConfig'],
  redirects: {},
  wranglerConfig: 'src/sites/dackel/wrangler.jsonc',
} as const satisfies SiteDefinition;
