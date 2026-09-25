import type { Collection } from 'tinacms';
import { bildFeld } from './fields';

export const NewsCollection: Collection = {
  name: 'news',
  label: 'Aktuelles',
  path: 'src/content/aktuelles',
  format: 'md',
  ui: {
    router: ({ document }) => `/aktuelles/${document._sys.filename}`,
    filename: {
      slugify: (values: { titel?: string }) =>
        (values?.titel || 'neuer-beitrag')
          .toLowerCase()
          .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
          .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    },
  },
  defaultItem: () => ({ datum: new Date().toISOString() }),
  fields: [
    { type: 'string', name: 'titel', label: 'Titel', isTitle: true, required: true },
    { type: 'datetime', name: 'datum', label: 'Datum', required: true, ui: { dateFormat: 'DD.MM.YYYY' } },
    { type: 'string', name: 'kurztext', label: 'Kurztext (für die Übersicht)', ui: { component: 'textarea' } },
    bildFeld('bild', 'Bild'),
    { type: 'rich-text', name: 'body', label: 'Beitrag', isBody: true },
  ],
};
