/**
 * Data loaders of the dackel site (its own Tina collections, shared generated client).
 * `requestWithMetadata()` makes click-to-edit work inside the Tina editor (iframe).
 */
import { requestWithMetadata } from '@tinacms/astro/data';
import client from '../../../../tina/__generated__/client';
import { sortiereHunde } from '../../../lib/domain/hund';
import { sortiereWuerfe } from '../../../lib/domain/wurf';

export const getConfig = () =>
  requestWithMetadata(client.queries.dackelConfig({ relativePath: 'config.json' }));

export const getPage = (slug: string) =>
  requestWithMetadata(client.queries.dackelPage({ relativePath: `${slug}.md` }), { priority: 'primary' });

export const getHund = (slug: string) =>
  requestWithMetadata(client.queries.dackelHund({ relativePath: `${slug}.md` }), { priority: 'primary' });

export const getWurf = (slug: string) =>
  requestWithMetadata(client.queries.dackelWurf({ relativePath: `${slug}.md` }), { priority: 'primary' });

const nodes = <T,>(edges?: ReadonlyArray<{ node?: T | null } | null> | null) =>
  (edges ?? []).flatMap((e) => (e?.node ? [e.node] : []));

export async function listPages() {
  const r = await client.queries.dackelPageConnection({ first: 100 });
  return nodes(r.data.dackelPageConnection.edges);
}

export async function listHunde() {
  const r = await client.queries.dackelHundConnection({ first: 100 });
  return sortiereHunde(nodes(r.data.dackelHundConnection.edges));
}

export async function listWuerfe() {
  const r = await client.queries.dackelWurfConnection({ first: 100 });
  return sortiereWuerfe(nodes(r.data.dackelWurfConnection.edges));
}

export type CmsConfig = Awaited<ReturnType<typeof getConfig>>['data']['dackelConfig'];
export type CmsPage = Awaited<ReturnType<typeof getPage>>['data']['dackelPage'];
export type CmsHund = Awaited<ReturnType<typeof getHund>>['data']['dackelHund'];
export type CmsWurf = Awaited<ReturnType<typeof getWurf>>['data']['dackelWurf'];
export type HundListItem = Awaited<ReturnType<typeof listHunde>>[number];
export type WurfListItem = Awaited<ReturnType<typeof listWuerfe>>[number];

export type PageBlock = NonNullable<NonNullable<CmsPage['blocks']>[number]>;
/** A block by its template name (`BlockOf<'Hero'>`), see blockName() in src/lib/tina-typename.ts. */
export type BlockOf<N extends string> = Extract<PageBlock, { __typename: `DackelPageBlocks${N}` }>;
