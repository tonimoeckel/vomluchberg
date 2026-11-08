import type { Collection } from 'tinacms';
import { hundKategorien, hundUrl } from '../../src/lib/domain/hund';
import { slugify } from '../../src/lib/domain/slug';
import { siteRouter } from '../sites/router';
import { galerieFeld, hundFelder } from './fields';

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
    hundFelder.name(),
    hundFelder.rufname,
    hundFelder.geschlecht,
    hundFelder.kategorie(hundKategorien),
    hundFelder.reihenfolge,
    hundFelder.geboren,
    hundFelder.verstorben,
    hundFelder.eltern('z. B. „Luis vom Eisernen Kreuz x Donna von der staubzer Höhe“'),
    hundFelder.gesundheit,
    { type: 'string', name: 'leistungen', label: 'Prüfungen & Titel', ui: { component: 'textarea' } },
    { type: 'string', name: 'workingDog', label: 'Link zu working-dog.com' },
    hundFelder.bild,
    hundFelder.body,
    galerieFeld,
  ],
};
