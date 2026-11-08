import type { SiteDefinition } from '../types';

/** Alltag kann Sport – Hundetraining Karolin Riesing (see docs/plan/02-training.md). */
export const training = {
  id: 'training',
  name: 'Alltag kann Sport',
  adminLabel: 'Training',
  collections: ['trainingPage', 'trainingAngebot', 'trainingConfig'],
  // Old Pfotentermin paths, in case someone types them on the new domain (02-training.md §7 task 12).
  // The tenant itself redirects its own URLs (§9, slice 3).
  redirects: {
    '/services': '/angebote',
    '/services/bff4106e-9676-4b1c-adfb-7c3c4aefbdd3': '/angebote/einzeltraining',
    '/services/670bef78-8545-4fa8-8c5d-3b0e7a785dbf': '/angebote/basistraining',
    '/services/20d50494-4833-4805-be2e-f82d2d57b30c': '/angebote/welpenkurs',
    '/ueber-uns': '/ueber-mich',
    '/book': '/anfrage',
    '/kontakt': '/anfrage',
    '/bewertungen': '/',
  },
  wranglerConfig: 'src/sites/training/wrangler.jsonc',
} as const satisfies SiteDefinition;
