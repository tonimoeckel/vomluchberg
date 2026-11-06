/**
 * Detail page collections of the dackel site (factory: src/lib/detailseite.ts).
 * Routes render a loaded page with <Detailseite>; islands.ts registers every entry of `detailseiten`.
 */
import type { IslandConfig } from '@tinacms/astro/experimental';
import Blocks from '../components/Blocks.astro';
import { detailseite } from '../../../lib/detailseite';
import { seiteSeo } from '../../../lib/domain/seo';
import { getPage, listPages } from './data';

export const seiten = detailseite('dackelPage', { get: getPage, list: listPages, seo: seiteSeo, Body: Blocks, index: 'home' });

/** All detail page collections – each one gets its live-editing island in islands.ts. */
export const detailseiten = [seiten];

/** Island registry entries of all detail pages, keyed by collection name. */
export const detailIslands = Object.fromEntries(detailseiten.map((d) => [d.name, d.island])) as Record<
  (typeof detailseiten)[number]['name'],
  IslandConfig
>;
