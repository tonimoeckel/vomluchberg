/**
 * Data loaders of the dackel site (its own Tina collections, shared generated client).
 * `requestWithMetadata()` makes click-to-edit work inside the Tina editor (iframe).
 */
import { requestWithMetadata } from '@tinacms/astro/data';
import client from '../../../../tina/__generated__/client';

export const getConfig = () =>
  requestWithMetadata(client.queries.dackelConfig({ relativePath: 'config.json' }));

export const getPage = (slug: string) =>
  requestWithMetadata(client.queries.dackelPage({ relativePath: `${slug}.md` }), { priority: 'primary' });

const nodes = <T,>(edges?: ReadonlyArray<{ node?: T | null } | null> | null) =>
  (edges ?? []).flatMap((e) => (e?.node ? [e.node] : []));

export async function listPages() {
  const r = await client.queries.dackelPageConnection({ first: 100 });
  return nodes(r.data.dackelPageConnection.edges);
}

export type CmsConfig = Awaited<ReturnType<typeof getConfig>>['data']['dackelConfig'];
export type CmsPage = Awaited<ReturnType<typeof getPage>>['data']['dackelPage'];

export type PageBlock = NonNullable<NonNullable<CmsPage['blocks']>[number]>;
/** A block by its template name (`BlockOf<'Hero'>`), see blockName() in src/lib/tina-typename.ts. */
export type BlockOf<N extends string> = Extract<PageBlock, { __typename: `DackelPageBlocks${N}` }>;
