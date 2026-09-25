/**
 * "A CMS detail page with live editing", defined once per collection:
 * static paths, loading, SEO, body component and the matching Tina island.
 * Routes render a loaded page with <Detailseite>; islands.ts registers the same islands.
 */
import type { IslandConfig } from '@tinacms/astro/experimental';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import Blocks from '../components/blocks/Blocks.astro';
import HundBody from '../components/islands/HundBody.astro';
import WurfBody from '../components/islands/WurfBody.astro';
import NewsBody from '../components/islands/NewsBody.astro';
import { getHund, getNews, getPage, getWurf, listHunde, listNews, listPages, listWuerfe } from './data';
import { hundSeo } from './domain/hund';
import { newsSeo } from './domain/news';
import { seiteSeo, type Seo } from './domain/seo';
import { wurfSeo } from './domain/wurf';

/** Tina response of one document; the collection name is also the island's registry key. */
type Antwort<N extends string> = { data: Record<N, object> };
type Dokument<N extends string, R extends Antwort<N>> = R['data'][N];

interface Definition<N extends string, R extends Antwort<N>> {
  get: (slug: string) => Promise<R>;
  list: () => Promise<readonly { _sys: { filename: string } }[]>;
  seo: (doc: Dokument<N, R>) => Seo;
  Body: AstroComponentFactory & ((props: { data: Dokument<N, R> }) => unknown);
  /** Document served at the site root instead of /[slug]; also the island's default slug. */
  index?: string;
}

/** Everything <Detailseite> renders. */
export interface GeladeneSeite {
  seo: Seo;
  island: { name: string; wrapper: IslandConfig['wrapper']; params: { slug: string } };
  Body: AstroComponentFactory;
  data: object;
}

export interface Detailseite<N extends string> {
  name: N;
  /** getStaticPaths of the /[slug] route (without the index document). */
  paths: () => Promise<{ params: { slug: string } }[]>;
  /** The document ready to render, null when it does not exist. Slug defaults to the index document. */
  load: (slug?: string) => Promise<GeladeneSeite | null>;
  /** Registry entry for /tina-island/<name>. */
  island: IslandConfig;
}

const wrapper = { tag: 'main' };

function detailseite<N extends string, R extends Antwort<N>>(name: N, def: Definition<N, R>): Detailseite<N> {
  const { get, list, seo, Body, index = '' } = def;
  const unwrap = (r: R) => (r.data?.[name] ?? null) as Dokument<N, R> | null;
  return {
    name,
    paths: async () =>
      (await list()).map((d) => d._sys.filename).filter((slug) => slug !== def.index).map((slug) => ({ params: { slug } })),
    load: async (slug = index) => {
      const data = unwrap(await get(slug));
      return data && { seo: seo(data), island: { name, wrapper, params: { slug } }, Body, data };
    },
    island: {
      fetch: (_r, params) => get(params.get('slug') ?? index),
      component: Body,
      wrapper,
      propsFromData: (d) => ({ data: unwrap(d as R) }),
    },
  };
}

export const seiten = detailseite('page', { get: getPage, list: listPages, seo: seiteSeo, Body: Blocks, index: 'home' });
export const hunde = detailseite('hund', { get: getHund, list: listHunde, seo: hundSeo, Body: HundBody });
export const wuerfe = detailseite('wurf', { get: getWurf, list: listWuerfe, seo: wurfSeo, Body: WurfBody });
export const aktuelles = detailseite('news', { get: getNews, list: listNews, seo: newsSeo, Body: NewsBody });
