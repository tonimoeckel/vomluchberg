/**
 * "A CMS detail page with live editing", defined once per collection:
 * static paths, loading, SEO, body component and the matching Tina island.
 * Shared by all sites; each site lists its definitions (e.g. src/lib/detailseiten.ts for luchberg)
 * and renders a loaded page with its <Detailseite> layout.
 */
import type { IslandConfig } from '@tinacms/astro/experimental';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import type { Seo } from './domain/seo';

/** Tina response of one document; the collection name is also the island's registry key. */
type TinaResult<N extends string> = { data: Record<N, object> };
type Doc<N extends string, R extends TinaResult<N>> = R['data'][N];

interface Definition<N extends string, R extends TinaResult<N>> {
  get: (slug: string) => Promise<R>;
  list: () => Promise<readonly { _sys: { filename: string } }[]>;
  seo: (doc: Doc<N, R>) => Seo;
  Body: AstroComponentFactory & ((props: { data: Doc<N, R> }) => unknown);
  /** Document served at the site root instead of /[slug]; also the island's default slug. */
  index?: string;
}

/** Everything <Detailseite> renders. */
export interface LoadedPage {
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
  load: (slug?: string) => Promise<LoadedPage | null>;
  /** Registry entry for /tina-island/<name>. */
  island: IslandConfig;
}

const wrapper = { tag: 'main' };

export function detailseite<N extends string, R extends TinaResult<N>>(name: N, def: Definition<N, R>): Detailseite<N> {
  const { get, list, seo, Body, index } = def;
  const unwrap = (r: R) => (r.data?.[name] ?? null) as Doc<N, R> | null;
  return {
    name,
    paths: async () =>
      (await list()).map((d) => d._sys.filename).filter((slug) => slug !== index).map((slug) => ({ params: { slug } })),
    load: async (slug = index ?? '') => {
      const data = unwrap(await get(slug));
      return data && { seo: seo(data), island: { name, wrapper, params: { slug } }, Body, data };
    },
    island: {
      fetch: (_r, params) => get(params.get('slug') ?? index ?? ''),
      component: Body,
      wrapper,
      propsFromData: (d) => ({ data: unwrap(d as R) }),
    },
  };
}
