/**
 * Site-aware Tina preview routers (see docs/plan/00-multisite.md, 2.6).
 *
 * The schema contains the collections of every site, but the admin can only preview pages on its
 * own origin. So a collection's `ui.router` returns a path only in the admin of the site that owns
 * the collection; in the other sites' admins the document is edited as a plain form.
 * Only `ui` functions may depend on the site – the schema itself must be identical for every SITE_ID.
 */
import { resolveSiteId, type SiteId } from '../../src/sites/index';

/**
 * Site of the running admin. Tina's admin bundle replaces `process.env` with the TINA_PUBLIC_*
 * variables only, so tina/config.ts copies SITE_ID to TINA_PUBLIC_SITE_ID while the CLI loads it
 * in Node (exposeSiteId). In Node (schema build, tests) SITE_ID is read directly.
 */
export const adminSiteId = (): SiteId =>
  resolveSiteId(process.env.TINA_PUBLIC_SITE_ID || process.env.SITE_ID);

/** Called once from tina/config.ts, in Node, before the CLI builds the admin bundle. */
export function exposeSiteId(): void {
  if (typeof process === 'undefined' || typeof window !== 'undefined') return;
  process.env.TINA_PUBLIC_SITE_ID = resolveSiteId(process.env.SITE_ID);
}

type RoutedDocument = { _sys: { filename: string } };

/** Preview router of a collection owned by `owner`: the document's path there, nothing elsewhere. */
export const siteRouter =
  <D extends RoutedDocument>(owner: SiteId, path: (document: D) => string | undefined) =>
  ({ document }: { document: D }): string | undefined =>
    adminSiteId() === owner ? path(document) : undefined;

/** Path of a block page: the `home` document is the site root. */
export const seitenPfad = (document: RoutedDocument): string =>
  document._sys.filename === 'home' ? '/' : `/${document._sys.filename}`;
