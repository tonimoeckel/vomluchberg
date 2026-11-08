/**
 * Detail page collections of the dackel site (factory: src/lib/detailseite.ts).
 * Routes render a loaded page with <Detailseite>; islands.ts registers every entry of `detailseiten`.
 */
import type { IslandConfig } from '@tinacms/astro/experimental';
import Blocks from '../components/Blocks.astro';
import HundBody from '../components/islands/HundBody.astro';
import WurfBody from '../components/islands/WurfBody.astro';
import { detailseite } from '../../../lib/detailseite';
import { dackelHunde } from '../../../lib/domain/dackel';
import { seiteSeo } from '../../../lib/domain/seo';
import { wurfSeo } from '../../../lib/domain/wurf';
import { getHund, getPage, getWurf, listHunde, listPages, listWuerfe } from './data';

export const seiten = detailseite('dackelPage', { get: getPage, list: listPages, seo: seiteSeo, Body: Blocks, index: 'home' });
export const hunde = detailseite('dackelHund', { get: getHund, list: listHunde, seo: dackelHunde.hundSeo, Body: HundBody });
export const wuerfe = detailseite('dackelWurf', { get: getWurf, list: listWuerfe, seo: wurfSeo, Body: WurfBody });

/** All detail page collections – each one gets its live-editing island in islands.ts. */
export const detailseiten = [seiten, hunde, wuerfe];

/** Island registry entries of all detail pages, keyed by collection name. */
export const detailIslands = Object.fromEntries(detailseiten.map((d) => [d.name, d.island])) as Record<
  (typeof detailseiten)[number]['name'],
  IslandConfig
>;
