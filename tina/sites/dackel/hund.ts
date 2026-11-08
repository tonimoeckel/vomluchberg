import type { Collection } from 'tinacms';
import { dackelFarben, dackelGroessen, dackelHunde, dackelKategorien } from '../../../src/lib/domain/dackel';
import { slugify } from '../../../src/lib/domain/slug';
import { galerieFeld, hundFelder } from '../../collections/fields';
import { siteRouter } from '../router';

/** Dachshunds ("Dackel · Unsere Dackel"), docs/plan/01-dackel.md §3. No titles/working-dog fields (K5). */
export const DackelHundCollection: Collection = {
  name: 'dackelHund',
  label: 'Dackel · Unsere Dackel',
  path: 'src/content/dackel/hunde',
  format: 'md',
  ui: {
    router: siteRouter('dackel', (document) => dackelHunde.hundUrl(document._sys.filename)),
    filename: {
      slugify: (values: { rufname?: string; name?: string }) => slugify(values?.rufname || values?.name, 'neuer-dackel'),
    },
  },
  defaultItem: () => ({ kategorie: 'zucht', geschlecht: 'huendin', groesse: 'standard', reihenfolge: 10 }),
  fields: [
    hundFelder.name('Name (mit Zwingername, falls vorhanden)'),
    { ...hundFelder.rufname, description: 'z. B. „Hanni“ – wird groß angezeigt' } as typeof hundFelder.rufname,
    hundFelder.geschlecht,
    hundFelder.kategorie(dackelKategorien),
    hundFelder.reihenfolge,
    { type: 'string', name: 'groesse', label: 'Größe', options: [...dackelGroessen] },
    { type: 'string', name: 'farbe', label: 'Farbe', options: [...dackelFarben] },
    hundFelder.geboren,
    hundFelder.verstorben,
    hundFelder.eltern('z. B. „Name der Mutter x Name des Vaters“'),
    { type: 'string', name: 'abstammung', label: 'Abstammung', description: 'z. B. „Beide Eltern stammen aus jagdlichen Linien …“', ui: { component: 'textarea' } },
    { type: 'string', name: 'brustumfang', label: 'Brustumfang (optional)', description: 'z. B. „34 cm“' },
    hundFelder.gesundheit,
    { type: 'boolean', name: 'auswaertig', label: 'Gehört nicht zu uns (z. B. der Vater unserer Dackel)' },
    { type: 'string', name: 'besitzer', label: 'Besitzer / Zwinger', description: 'Nur bei Hunden, die nicht bei uns leben' },
    hundFelder.bild,
    hundFelder.body,
    galerieFeld,
  ],
};
