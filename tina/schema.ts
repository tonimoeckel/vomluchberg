/**
 * Every Tina collection of every site. The schema (and with it tina-lock.json) must be identical
 * for every SITE_ID – TinaCloud indexes one schema per repo. Never filter this list by site;
 * only `ui` functions (preview routers, see tina/sites/router.ts) may depend on the site.
 * Each site lists the collections it owns in src/sites/<id>/site.ts (`collections`).
 */
import type { Collection } from 'tinacms';
import { ConfigCollection } from './collections/config';
import { PageCollection } from './collections/page';
import { HundCollection } from './collections/hund';
import { WurfCollection } from './collections/wurf';
import { NewsCollection } from './collections/news';

export const collections: Collection[] = [
  // luchberg (Rottweiler) – names and paths stay as they are (document ids, see 00-multisite.md §3)
  PageCollection,
  HundCollection,
  WurfCollection,
  NewsCollection,
  ConfigCollection,
];
