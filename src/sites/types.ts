/** Definition of one website built from this repo (pure data – also read by astro.config.mjs and tests). */
export interface SiteDefinition {
  id: string;
  /** Default site name, used when the CMS config has none. */
  name: string;
  /** Old URL → new URL (301). Only applied to the build of this site. */
  redirects: Record<string, string>;
  /** Wrangler config of this site's worker, relative to the repo root. Omitted = root `wrangler.jsonc`. */
  wranglerConfig?: string;
}
