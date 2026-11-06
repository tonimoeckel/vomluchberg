import type { Collection } from 'tinacms';
import { geschlechter, hundKategorien, hundUrl } from '../../src/lib/domain/hund';
import { slugify } from '../../src/lib/domain/slug';
import { siteRouter } from '../sites/router';
import { bildFeld, galerieFeld } from './fields';

export const HundCollection: Collection = {
  name: 'hund',
  label: 'Rottweiler · Unsere Hunde',
  path: 'src/content/hunde',
  format: 'md',
  ui: {
    router: siteRouter('luchberg', (document) => hundUrl(document._sys.filename)),
    filename: {
      slugify: (values: { name?: string }) => slugify(values?.name, 'neuer-hund'),
    },
  },
  defaultItem: () => ({ kategorie: 'zucht', geschlecht: 'huendin', reihenfolge: 10 }),
  fields: [
    { type: 'string', name: 'name', label: 'Name (mit Zwingername)', isTitle: true, required: true },
    { type: 'string', name: 'rufname', label: 'Rufname', description: 'z. B. „Baja“ – wird groß angezeigt' },
    {
      type: 'string', name: 'geschlecht', label: 'Geschlecht',
      options: [...geschlechter],
    },
    {
      type: 'string', name: 'kategorie', label: 'Wo soll der Hund erscheinen?',
      options: [...hundKategorien],
    },
    { type: 'number', name: 'reihenfolge', label: 'Reihenfolge', description: 'Kleinere Zahl = weiter vorne' },
    { type: 'datetime', name: 'geboren', label: 'Wurftag', ui: { dateFormat: 'DD.MM.YYYY' } },
    { type: 'string', name: 'verstorben', label: 'Verstorben am (optional)', description: 'Nur ausfüllen, wenn der Hund verstorben ist – z. B. 19.12.2025' },
    { type: 'string', name: 'eltern', label: 'Eltern', description: 'z. B. „Luis vom Eisernen Kreuz x Donna von der staubzer Höhe“' },
    { type: 'string', name: 'gesundheit', label: 'Gesundheit', ui: { component: 'textarea' } },
    { type: 'string', name: 'leistungen', label: 'Prüfungen & Titel', ui: { component: 'textarea' } },
    { type: 'string', name: 'workingDog', label: 'Link zu working-dog.com' },
    bildFeld('bild', 'Hauptbild'),
    { type: 'rich-text', name: 'body', label: 'Text über den Hund', isBody: true },
    galerieFeld,
  ],
};
