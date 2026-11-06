/**
 * File-based routing for src/sites/<id>/pages/** (same rules as Astro's src/pages).
 * Pure – used by the multisite integration and its tests.
 */

const ROUTE_FILE = /\.(astro|ts|js)$/;

/** Whether a file below a site's pages folder is a route (underscore files/folders and other extensions are not). */
export function isRouteFile(rel: string): boolean {
  const parts = rel.replace(/\\/g, '/').split('/');
  return ROUTE_FILE.test(rel) && !parts.some((p) => p.startsWith('_')) && !/\.d\.ts$/.test(rel);
}

/** Route pattern of a page file, e.g. `hunde/[slug].astro` → `/hunde/[slug]`, `index.astro` → `/`. */
export function routePattern(rel: string): string {
  const segments = rel
    .replace(/\\/g, '/')
    .replace(ROUTE_FILE, '')
    .split('/')
    .filter(Boolean);
  if (segments.at(-1) === 'index') segments.pop();
  return '/' + segments.join('/');
}
