/**
 * Registry aller Bereiche, die im Tina-Editor live aktualisiert werden.
 * Die Route /tina-island/[name] liefert beim Bearbeiten die neu gerenderten HTML-Teile.
 */
import type { IslandRegistry } from '@tinacms/astro/experimental';
import type { QueryResult } from '@tinacms/astro/data';
import type { ConfigQuery, HundQuery, NewsQuery, PageQuery, WurfQuery } from '../../tina/__generated__/types';
import PageBody from '../components/islands/PageBody.astro';
import HundBody from '../components/islands/HundBody.astro';
import WurfBody from '../components/islands/WurfBody.astro';
import NewsBody from '../components/islands/NewsBody.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { getConfig, getHund, getNews, getPage, getWurf } from './data';

export const islands: IslandRegistry = {
  page: {
    fetch: (_r, params) => getPage(params.get('slug') ?? 'home'),
    component: PageBody,
    wrapper: { tag: 'main' },
    propsFromData: (d) => ({ data: (d as QueryResult<PageQuery>).data?.page }),
  },
  hund: {
    fetch: (_r, params) => getHund(params.get('slug') ?? ''),
    component: HundBody,
    wrapper: { tag: 'main' },
    propsFromData: (d) => ({ data: (d as QueryResult<HundQuery>).data?.hund }),
  },
  wurf: {
    fetch: (_r, params) => getWurf(params.get('slug') ?? ''),
    component: WurfBody,
    wrapper: { tag: 'main' },
    propsFromData: (d) => ({ data: (d as QueryResult<WurfQuery>).data?.wurf }),
  },
  news: {
    fetch: (_r, params) => getNews(params.get('slug') ?? ''),
    component: NewsBody,
    wrapper: { tag: 'main' },
    propsFromData: (d) => ({ data: (d as QueryResult<NewsQuery>).data?.news }),
  },
  global: {
    fetch: () => getConfig(),
    component: Header,
    wrapper: { tag: 'div' },
    propsFromData: (d) => ({ config: (d as QueryResult<ConfigQuery>).data?.config }),
  },
  'global-footer': {
    fetch: () => getConfig(),
    component: Footer,
    wrapper: { tag: 'div' },
    propsFromData: (d) => ({ config: (d as QueryResult<ConfigQuery>).data?.config }),
  },
};
