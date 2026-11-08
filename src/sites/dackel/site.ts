import type { SiteDefinition } from '../types';

/** Rauhaardackel vom Luchberg (working name, see docs/plan/01-dackel.md). */
export const dackel = {
  id: 'dackel',
  name: 'Rauhaardackel vom Luchberg',
  adminLabel: 'Dackel',
  // Not live yet: runs on dackel.vomluchberg.de (noindex) until its own domain exists (03-betrieb O11).
  // At go-live set `url` to the domain and `live: true`; then vomluchberg.de shows its hint.
  live: false,
  querverweise: ['luchberg'],
  collections: ['dackelPage', 'dackelHund', 'dackelWurf', 'dackelConfig'],
  redirects: {},
  wranglerConfig: 'src/sites/dackel/wrangler.jsonc',
} as const satisfies SiteDefinition;
