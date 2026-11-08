/**
 * Detail page collections of the training site (factory: src/lib/detailseite.ts).
 * Routes render a loaded page with <Detailseite>; islands.ts registers every entry of `detailseiten`.
 */
import type { IslandConfig } from '@tinacms/astro/experimental';
import Blocks from '../components/Blocks.astro';
import AngebotBody from '../components/AngebotBody.astro';
import { detailseite } from '../../../lib/detailseite';
import { seiteSeo } from '../../../lib/domain/seo';
import { angebotSeo } from '../../../lib/domain/angebot';
import { getAngebot, getPage, listPages, listSichtbareAngebote } from './data';

export const seiten = detailseite('trainingPage', { get: getPage, list: listPages, seo: seiteSeo, Body: Blocks, index: 'home' });

/** Offers at /angebote/<slug>; hidden offers ("sichtbar: false") are not built. */
export const angebote = detailseite('trainingAngebot', {
  get: getAngebot,
  list: listSichtbareAngebote,
  seo: (a) => angebotSeo({ ...a, bild: a.bild ?? null }),
  Body: AngebotBody,
});

/** All detail page collections – each one gets its live-editing island in islands.ts. */
export const detailseiten = [seiten, angebote];

/** Island registry entries of all detail pages, keyed by collection name. */
export const detailIslands = Object.fromEntries(detailseiten.map((d) => [d.name, d.island])) as Record<
  (typeof detailseiten)[number]['name'],
  IslandConfig
>;
