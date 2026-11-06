/** robots.txt and the noindex switch for preview deployments (pure). */

/** SITE_NOINDEX=true (or 1/yes) keeps a deployment out of search engines, e.g. on *.workers.dev before launch. */
export function isNoindex(raw: string | undefined | null): boolean {
  return ['true', '1', 'yes'].includes((raw ?? '').trim().toLowerCase());
}

/** robots.txt of a site: everything allowed plus the sitemap, or everything disallowed for previews. */
export function robotsTxt({ site, noindex }: { site: URL | undefined; noindex: boolean }): string {
  if (noindex) return 'User-agent: *\nDisallow: /\n';
  const lines = ['User-agent: *', 'Allow: /'];
  if (site) lines.push('', `Sitemap: ${new URL('sitemap-index.xml', site).href}`);
  return lines.join('\n') + '\n';
}
