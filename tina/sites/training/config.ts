import type { TinaField } from 'tinacms';
import { navFeld, websiteFeld } from '../../collections/fields';
import { einstellungenCollection } from '../collections';
import { farbschemaOptions } from '../../../src/sites/training/lib/farbschema';

const textarea = { component: 'textarea' } as const;

/** Website group plus the short claim in the footer. */
const website: TinaField = {
  ...websiteFeld,
  fields: [
    ...(websiteFeld as { fields: TinaField[] }).fields,
    { type: 'string', name: 'fusszeile', label: 'Kurzer Satz im Fußbereich', ui: textarea },
  ],
} as TinaField;

const kontakt: TinaField = {
  type: 'object', name: 'kontakt', label: 'Kontaktdaten',
  fields: [
    { type: 'string', name: 'name', label: 'Name' },
    { type: 'string', name: 'ortName', label: 'Name des Trainingsorts', description: 'z. B. „Trainingsgelände Glashütte“' },
    { type: 'string', name: 'strasse', label: 'Straße' },
    { type: 'string', name: 'ort', label: 'PLZ & Ort' },
    { type: 'string', name: 'region', label: 'Region', description: 'z. B. „Osterzgebirge, Sachsen“' },
    { type: 'string', name: 'ortText', label: 'Satz zum Trainingsort', ui: textarea },
    { type: 'string', name: 'telefon', label: 'Telefon (leer = nicht zeigen)' },
    { type: 'string', name: 'email', label: 'E-Mail (hierhin gehen auch die Anfragen ohne Formular-Dienst)' },
    { type: 'string', name: 'mapsLink', label: 'Link „In Google Maps öffnen“' },
  ],
};

const social: TinaField = {
  type: 'object', name: 'social', label: 'Social Media',
  fields: [
    { type: 'string', name: 'instagram', label: 'Instagram-Link' },
    { type: 'string', name: 'instagramName', label: 'Instagram-Name', description: 'z. B. @karoriesing_caninepure' },
  ],
};

const anfrage: TinaField = {
  type: 'object', name: 'anfrage', label: 'Anfrageformular',
  fields: [
    { type: 'string', name: 'hinweis', label: 'Hinweis unter dem Button', ui: textarea },
    { type: 'string', name: 'danke', label: 'Meldung nach dem Absenden', ui: textarea },
  ],
};

const menueButton: TinaField = {
  type: 'object', name: 'menueButton', label: 'Button im Menü',
  fields: [
    { type: 'string', name: 'label', label: 'Beschriftung' },
    { type: 'string', name: 'link', label: 'Link' },
  ],
};

const querverweis: TinaField = {
  type: 'object', name: 'querverweis', label: 'Hinweis auf die Zucht (Fußbereich)',
  fields: [
    { type: 'string', name: 'text', label: 'Text' },
    { type: 'string', name: 'linkText', label: 'Link-Beschriftung' },
    { type: 'string', name: 'link', label: 'Link' },
  ],
};

/** Colour scheme of the whole site (tokens in src/sites/training/styles/global.css). */
const farbschemaFeld: TinaField = {
  type: 'string', name: 'farbschema', label: 'Farbschema',
  description: 'Farben der ganzen Website (hell und dunkel). Die Schrift und das Layout bleiben gleich.',
  options: farbschemaOptions,
};

/** Settings of the training site (docs/plan/02-training.md §4.3). */
export const TrainingConfigCollection = einstellungenCollection('training', [
  website,
  farbschemaFeld,
  kontakt,
  social,
  anfrage,
  navFeld,
  menueButton,
  querverweis,
]);
