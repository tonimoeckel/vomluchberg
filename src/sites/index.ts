/**
 * Registry of all websites built from this repo. One build = one site, chosen by the env var SITE_ID.
 * Pure TS: imported by astro.config.mjs, tina/ and tests – no Astro or Tina imports here.
 */
import { dackel } from './dackel/site';
import { luchberg } from './luchberg/site';
import { training } from './training/site';
import type { SiteDefinition } from './types';

export type { SiteDefinition } from './types';

export const sites = { luchberg, dackel, training } as const satisfies Record<string, SiteDefinition>;

export type SiteId = keyof typeof sites;
export const SITE_IDS = Object.keys(sites) as SiteId[];
export const DEFAULT_SITE_ID: SiteId = 'luchberg';

/** SITE_ID from the environment; empty means the default site, unknown ids fail the build. */
export function resolveSiteId(raw: string | undefined | null): SiteId {
  const id = (raw ?? '').trim();
  if (!id) return DEFAULT_SITE_ID;
  if ((SITE_IDS as string[]).includes(id)) return id as SiteId;
  throw new Error(`Unknown SITE_ID "${id}". Known sites: ${SITE_IDS.join(', ')}`);
}
