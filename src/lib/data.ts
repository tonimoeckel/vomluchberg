/**
 * Daten-Loader für alle Tina-Collections.
 * `requestWithMetadata()` sorgt dafür, dass im Tina-Editor (iframe) die
 * Klick-zum-Bearbeiten-Markierungen funktionieren.
 */
import type { TinaRichTextContent } from '@tinacms/astro';
import { requestWithMetadata } from '@tinacms/astro/data';
import client from '../../tina/__generated__/client';
import { sortiereHunde } from './domain/hund';
import { sortiereNews } from './domain/news';
import { sortiereWuerfe } from './domain/wurf';

export const getConfig = () =>
  requestWithMetadata(client.queries.config({ relativePath: 'config.json' }));

export const getPage = (slug: string) =>
  requestWithMetadata(client.queries.page({ relativePath: `${slug}.md` }), { priority: 'primary' });

export const getHund = (slug: string) =>
  requestWithMetadata(client.queries.hund({ relativePath: `${slug}.md` }), { priority: 'primary' });

export const getWurf = (slug: string) =>
  requestWithMetadata(client.queries.wurf({ relativePath: `${slug}.md` }), { priority: 'primary' });

export const getNews = (slug: string) =>
  requestWithMetadata(client.queries.news({ relativePath: `${slug}.md` }), { priority: 'primary' });

const nodes = <T,>(edges?: ReadonlyArray<{ node?: T | null } | null> | null) =>
  (edges ?? []).flatMap((e) => (e?.node ? [e.node] : []));

export async function listPages() {
  const r = await client.queries.pageConnection({ first: 100 });
  return nodes(r.data.pageConnection.edges);
}

export async function listHunde() {
  const r = await client.queries.hundConnection({ first: 100 });
  return sortiereHunde(nodes(r.data.hundConnection.edges));
}

export async function listWuerfe() {
  const r = await client.queries.wurfConnection({ first: 100 });
  return sortiereWuerfe(nodes(r.data.wurfConnection.edges));
}

export async function listNews() {
  const r = await client.queries.newsConnection({ first: 500 });
  return sortiereNews(nodes(r.data.newsConnection.edges));
}

export type CmsConfig = Awaited<ReturnType<typeof getConfig>>['data']['config'];
export type CmsPage = Awaited<ReturnType<typeof getPage>>['data']['page'];
export type CmsHund = Awaited<ReturnType<typeof getHund>>['data']['hund'];
export type CmsWurf = Awaited<ReturnType<typeof getWurf>>['data']['wurf'];
export type CmsNews = Awaited<ReturnType<typeof getNews>>['data']['news'];
export type HundListItem = Awaited<ReturnType<typeof listHunde>>[number];
export type WurfListItem = Awaited<ReturnType<typeof listWuerfe>>[number];
export type NewsListItem = Awaited<ReturnType<typeof listNews>>[number];

export type PageBlock = NonNullable<NonNullable<CmsPage['blocks']>[number]>;
export type BlockOf<T extends PageBlock['__typename']> = Extract<PageBlock, { __typename: T }>;

export type RichText = TinaRichTextContent;
