/**
 * Detail page collections of the luchberg site (factory: src/lib/detailseite.ts).
 * Routes render a loaded page with <Detailseite>; islands.ts registers every entry of `detailseiten`.
 */
import type { IslandConfig } from '@tinacms/astro/experimental';
import Blocks from '../components/blocks/Blocks.astro';
import HundBody from '../components/islands/HundBody.astro';
import WurfBody from '../components/islands/WurfBody.astro';
import NewsBody from '../components/islands/NewsBody.astro';
import { getHund, getNews, getPage, getWurf, listHunde, listNews, listPages, listWuerfe } from './data';
import { detailseite } from './detailseite';
import { hundSeo } from './domain/hund';
import { newsSeo } from './domain/news';
import { seiteSeo } from './domain/seo';
import { wurfSeo } from './domain/wurf';

export const seiten = detailseite('page', { get: getPage, list: listPages, seo: seiteSeo, Body: Blocks, index: 'home' });
export const hunde = detailseite('hund', { get: getHund, list: listHunde, seo: hundSeo, Body: HundBody });
export const wuerfe = detailseite('wurf', { get: getWurf, list: listWuerfe, seo: wurfSeo, Body: WurfBody });
export const aktuelles = detailseite('news', { get: getNews, list: listNews, seo: newsSeo, Body: NewsBody });

/** All detail page collections – each one gets its live-editing island in islands.ts. */
export const detailseiten = [seiten, hunde, wuerfe, aktuelles];

/** Island registry entries of all detail pages, keyed by collection name. */
export const detailIslands = Object.fromEntries(detailseiten.map((d) => [d.name, d.island])) as Record<
  (typeof detailseiten)[number]['name'],
  IslandConfig
>;
