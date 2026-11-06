import type { Collection } from 'tinacms';
import { farbschemaOptions } from '../../src/lib/farbschema';
import { navFeld, websiteFeld } from './fields';

export const ConfigCollection: Collection = {
  name: 'config',
  label: 'Rottweiler · Einstellungen',
  path: 'src/content/config',
  format: 'json',
  ui: { global: true, allowedActions: { create: false, delete: false } },
  fields: [
    websiteFeld,
    {
      type: 'string', name: 'farbschema', label: 'Farbschema',
      options: farbschemaOptions,
    },
    {
      type: 'object', name: 'kontakt', label: 'Kontaktdaten',
      fields: [
        { type: 'string', name: 'zwinger', label: 'Zwinger' },
        { type: 'string', name: 'zuechterin', label: 'Züchterin' },
        { type: 'string', name: 'strasse', label: 'Straße' },
        { type: 'string', name: 'ort', label: 'PLZ & Ort' },
        { type: 'string', name: 'telefon', label: 'Telefon' },
        { type: 'string', name: 'email', label: 'E-Mail' },
      ],
    },
    {
      type: 'object', name: 'social', label: 'Social Media & Verband',
      fields: [
        { type: 'string', name: 'facebook', label: 'Facebook-Link' },
        { type: 'string', name: 'instagram', label: 'Instagram-Link' },
        { type: 'string', name: 'workingDog', label: 'Zuchtstätte auf working-dog.com' },
        { type: 'string', name: 'verband', label: 'Verband (Text)', description: 'z. B. „Mitglied im ADRK – Zwingernummer 2461“' },
        { type: 'string', name: 'verbandLink', label: 'Verband (Link)' },
      ],
    },
    navFeld,
  ],
};
