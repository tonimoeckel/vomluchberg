import type { Collection } from 'tinacms';
import { allBlocks } from '../blocks';

export const PageCollection: Collection = {
  name: 'page',
  label: 'Seiten',
  path: 'src/content/seiten',
  format: 'md',
  ui: {
    router: ({ document }) => (document._sys.filename === 'home' ? '/' : `/${document._sys.filename}`),
  },
  fields: [
    { type: 'string', name: 'titel', label: 'Seitentitel (Browser-Tab & Google)', isTitle: true, required: true },
    { type: 'string', name: 'beschreibung', label: 'Beschreibung für Google', ui: { component: 'textarea' } },
    {
      type: 'object', list: true, name: 'blocks', label: 'Seiteninhalte',
      ui: { visualSelector: false },
      templates: allBlocks,
    },
  ],
};
