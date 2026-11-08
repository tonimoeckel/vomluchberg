/**
 * Collection factories for the sites added after luchberg (dackel, training). Each site composes
 * its own collections from these in tina/sites/<id>/; luchberg keeps its own in tina/collections/.
 * Names are `<siteId><Name>`, paths `src/content/<siteId>/…`, labels "<adminLabel> · …"
 * (checked in src/sites/schema.test.ts).
 */
import type { Collection, Template, TinaField } from 'tinacms';
import { sites, type SiteId } from '../../src/sites/index';
import { navFeld, websiteFeld } from '../collections/fields';
import { seitenPfad, siteRouter } from './router';

/** Block-based pages ("Seiten") of a site; `home` is served at `/`. */
export const seitenCollection = (site: SiteId, templates: Template[]): Collection => ({
  name: `${site}Page`,
  label: `${sites[site].adminLabel} · Seiten`,
  path: `src/content/${site}/seiten`,
  format: 'md',
  ui: { router: siteRouter(site, seitenPfad) },
  fields: [
    { type: 'string', name: 'titel', label: 'Seitentitel (Browser-Tab & Google)', isTitle: true, required: true },
    { type: 'string', name: 'beschreibung', label: 'Beschreibung für Google', ui: { component: 'textarea' } },
    {
      type: 'object', list: true, name: 'blocks', label: 'Seiteninhalte',
      ui: { visualSelector: false },
      templates,
    },
  ],
});

/** Contact details shown in the footer. Sites may replace it with their own group. */
export const kontaktFeld: TinaField = {
  type: 'object', name: 'kontakt', label: 'Kontaktdaten',
  fields: [
    { type: 'string', name: 'name', label: 'Name' },
    { type: 'string', name: 'strasse', label: 'Straße' },
    { type: 'string', name: 'ort', label: 'PLZ & Ort' },
    { type: 'string', name: 'telefon', label: 'Telefon' },
    { type: 'string', name: 'email', label: 'E-Mail' },
  ],
};

/** Global settings ("Einstellungen") of a site: one JSON document `config.json`. */
export const einstellungenCollection = (site: SiteId, fields: TinaField[]): Collection => ({
  name: `${site}Config`,
  label: `${sites[site].adminLabel} · Einstellungen`,
  path: `src/content/${site}/config`,
  format: 'json',
  ui: { global: true, allowedActions: { create: false, delete: false } },
  fields,
});

/** The settings every site starts with: website, contact, menu. */
export const basisEinstellungen: TinaField[] = [websiteFeld, kontaktFeld, navFeld];
