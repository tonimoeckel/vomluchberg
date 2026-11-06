/** Definition of one website built from this repo (pure data – also read by astro.config.mjs and tests). */
export interface SiteDefinition {
  id: string;
  /** Prefix of this site's collection labels in the shared admin, e.g. "Rottweiler" → "Rottweiler · Seiten". */
  adminLabel: string;
  /** Default site name, used when the CMS config has none. */
  name: string;
  /** Old URL → new URL (301). Only applied to the build of this site. */
  redirects: Record<string, string>;
  /** Wrangler config of this site's worker, relative to the repo root. Omitted = root `wrangler.jsonc`. */
  wranglerConfig?: string;
  /** Names of the Tina collections this site owns (all sites share one schema, see tina/schema.ts). */
  collections: readonly string[];
}
