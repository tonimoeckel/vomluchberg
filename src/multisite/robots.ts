/** robots.txt and the noindex switch for preview deployments (pure). */

/** SITE_NOINDEX=true (or 1/yes) keeps a deployment out of search engines, e.g. on *.workers.dev before launch. */
export function isNoindex(raw: string | undefined | null): boolean {
  return ['true', '1', 'yes'].includes((raw ?? '').trim().toLowerCase());
}

/** Branch Workers Builds deploys to production; builds of every other branch are previews. */
export const PRODUCTION_BRANCH = 'main';

/**
 * Whether this build stays out of search engines, and why (for the build log).
 * SITE_NOINDEX decides when it is set to a yes/no value; otherwise every Workers Builds build of a
 * branch other than `main` (a preview, WORKERS_CI_BRANCH) is noindex. Local builds are indexable.
 */
export function noindexFromEnv(env: { SITE_NOINDEX?: string; WORKERS_CI_BRANCH?: string }): { noindex: boolean; reason: string } {
  const flag = (env.SITE_NOINDEX ?? '').trim().toLowerCase();
  if (isNoindex(flag)) return { noindex: true, reason: 'SITE_NOINDEX is set' };
  if (['false', '0', 'no'].includes(flag)) return { noindex: false, reason: 'SITE_NOINDEX=false' };
  const branch = (env.WORKERS_CI_BRANCH ?? '').trim();
  if (branch && branch !== PRODUCTION_BRANCH) return { noindex: true, reason: `preview build of branch "${branch}"` };
  return { noindex: false, reason: branch ? `production build of "${branch}"` : 'local build' };
}

/** robots.txt of a site: everything allowed plus the sitemap, or everything disallowed for previews. */
export function robotsTxt({ site, noindex }: { site: URL | undefined; noindex: boolean }): string {
  if (noindex) return 'User-agent: *\nDisallow: /\n';
  const lines = ['User-agent: *', 'Allow: /'];
  if (site) lines.push('', `Sitemap: ${new URL('sitemap-index.xml', site).href}`);
  return lines.join('\n') + '\n';
}
