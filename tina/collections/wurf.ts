import type { Collection } from 'tinacms';
import { wurfSlug, wurfUrl } from '../../src/lib/domain/wurf';
import { siteRouter } from '../sites/router';
import { wurfFelder } from './fields';

export const WurfCollection: Collection = {
  name: 'wurf',
  label: 'Rottweiler · Würfe',
  path: 'src/content/wuerfe',
  format: 'md',
  ui: {
    router: siteRouter('luchberg', (document) => wurfUrl(document._sys.filename)),
    filename: {
      slugify: (values: { buchstabe?: string }) => wurfSlug(values?.buchstabe),
    },
  },
  defaultItem: () => ({ status: 'geplant' }),
  fields: wurfFelder({ linkHinweis: ' (working-dog.com)' }),
};
