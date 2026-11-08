/**
 * Data loaders of the training site (its own Tina collections, shared generated client).
 * `requestWithMetadata()` makes click-to-edit work inside the Tina editor (iframe).
 */
import { requestWithMetadata } from '@tinacms/astro/data';
import client from '../../../../tina/__generated__/client';
import { sortiereAngebote } from '../../../lib/domain/angebot';

export const getConfig = () =>
  requestWithMetadata(client.queries.trainingConfig({ relativePath: 'config.json' }));

export const getPage = (slug: string) =>
  requestWithMetadata(client.queries.trainingPage({ relativePath: `${slug}.md` }), { priority: 'primary' });

export const getAngebot = (slug: string) =>
  requestWithMetadata(client.queries.trainingAngebot({ relativePath: `${slug}.md` }), { priority: 'primary' });

const nodes = <T,>(edges?: ReadonlyArray<{ node?: T | null } | null> | null) =>
  (edges ?? []).flatMap((e) => (e?.node ? [e.node] : []));

export async function listPages() {
  const r = await client.queries.trainingPageConnection({ first: 100 });
  return nodes(r.data.trainingPageConnection.edges);
}

/** All offers (hidden ones included), in display order. */
export async function listAngebote() {
  const r = await client.queries.trainingAngebotConnection({ first: 100 });
  return sortiereAngebote(nodes(r.data.trainingAngebotConnection.edges));
}

/** Offers with their slug (= file name), as the domain rules in src/lib/domain/{angebot,anfrage}.ts expect them. */
export async function listAngeboteMitSlug() {
  return (await listAngebote()).map((a) => ({ ...a, slug: a._sys.filename }));
}

/** Offers that are built as detail pages (hidden ones are not built). */
export async function listSichtbareAngebote() {
  return (await listAngebote()).filter((a) => a.sichtbar !== false);
}

export type CmsConfig = Awaited<ReturnType<typeof getConfig>>['data']['trainingConfig'];
export type CmsPage = Awaited<ReturnType<typeof getPage>>['data']['trainingPage'];
export type CmsAngebot = Awaited<ReturnType<typeof getAngebot>>['data']['trainingAngebot'];
export type AngebotListItem = Awaited<ReturnType<typeof listAngeboteMitSlug>>[number];

export type PageBlock = NonNullable<NonNullable<CmsPage['blocks']>[number]>;
/** A block by its template name (`BlockOf<'Hero'>`), see blockName() in src/lib/tina-typename.ts. */
export type BlockOf<N extends string> = Extract<PageBlock, { __typename: `TrainingPageBlocks${N}` }>;
