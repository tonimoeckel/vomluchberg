import type { Collection } from 'tinacms';
import { bildFeld, galerieFeld } from './fields';

export const WurfCollection: Collection = {
  name: 'wurf',
  label: 'Würfe',
  path: 'src/content/wuerfe',
  format: 'md',
  ui: {
    router: ({ document }) => `/wuerfe/${document._sys.filename}`,
    filename: {
      slugify: (values: { buchstabe?: string }) =>
        `${(values?.buchstabe || 'x').toLowerCase()}-wurf`,
    },
  },
  defaultItem: () => ({ status: 'geplant' }),
  fields: [
    { type: 'string', name: 'titel', label: 'Titel', isTitle: true, required: true, description: 'z. B. „C-Wurf“' },
    { type: 'string', name: 'buchstabe', label: 'Buchstabe', required: true },
    {
      type: 'string', name: 'status', label: 'Status',
      options: [
        { value: 'geplant', label: 'In Planung' },
        { value: 'aktuell', label: 'Welpen sind da' },
        { value: 'vergangen', label: 'Abgeschlossen' },
      ],
    },
    { type: 'datetime', name: 'wurfdatum', label: 'Wurftag (oder erwartet)', ui: { dateFormat: 'DD.MM.YYYY' } },
    { type: 'string', name: 'vater', label: 'Vater' },
    { type: 'string', name: 'vaterLink', label: 'Vater – Link (working-dog.com)' },
    { type: 'string', name: 'mutter', label: 'Mutter' },
    { type: 'string', name: 'mutterLink', label: 'Mutter – Link (working-dog.com)' },
    { type: 'string', name: 'kurztext', label: 'Kurztext (für die Übersicht)', ui: { component: 'textarea' } },
    bildFeld('bild', 'Titelbild'),
    { type: 'rich-text', name: 'body', label: 'Text', isBody: true },
    {
      type: 'object', name: 'welpen', label: 'Welpen', list: true,
      ui: { itemProps: (item: { name?: string }) => ({ label: item?.name || 'Welpe' }) },
      fields: [
        { type: 'string', name: 'name', label: 'Name' },
        {
          type: 'string', name: 'geschlecht', label: 'Geschlecht',
          options: [{ value: 'huendin', label: 'Hündin' }, { value: 'ruede', label: 'Rüde' }],
        },
        { type: 'image', name: 'bild', label: 'Bild' },
        { type: 'string', name: 'link', label: 'Link (working-dog.com)' },
        { type: 'string', name: 'notiz', label: 'Notiz', description: 'z. B. „vermittelt“ oder „bleibt bei uns“' },
      ],
    },
    galerieFeld,
  ],
};
