import type { Collection } from 'tinacms';
import { allBlocks } from '../blocks';
import { seitenPfad, siteRouter } from '../sites/router';

export const PageCollection: Collection = {
  name: 'page',
  label: 'Rottweiler · Seiten',
  path: 'src/content/seiten',
  format: 'md',
  ui: {
    router: siteRouter('luchberg', seitenPfad),
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
