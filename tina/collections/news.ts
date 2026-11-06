import type { Collection } from 'tinacms';
import { newsUrl } from '../../src/lib/domain/news';
import { slugify } from '../../src/lib/domain/slug';
import { siteRouter } from '../sites/router';
import { bildFeld } from './fields';

export const NewsCollection: Collection = {
  name: 'news',
  label: 'Rottweiler · Aktuelles',
  path: 'src/content/aktuelles',
  format: 'md',
  ui: {
    router: siteRouter('luchberg', (document) => newsUrl(document._sys.filename)),
    filename: {
      slugify: (values: { titel?: string }) => slugify(values?.titel, 'neuer-beitrag'),
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
