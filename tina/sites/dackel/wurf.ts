import type { Collection } from 'tinacms';
import { dackelFarben, dackelWuerfe } from '../../../src/lib/domain/dackel';
import { wurfSlug } from '../../../src/lib/domain/wurf';
import { wurfFelder } from '../../collections/fields';
import { siteRouter } from '../router';

/** Litters and puppies ("Dackel · Würfe & Welpen"), shown below /welpen. */
export const DackelWurfCollection: Collection = {
  name: 'dackelWurf',
  label: 'Dackel · Würfe & Welpen',
  path: 'src/content/dackel/wuerfe',
  format: 'md',
  ui: {
    router: siteRouter('dackel', (document) => dackelWuerfe.wurfUrl(document._sys.filename)),
    filename: {
      slugify: (values: { buchstabe?: string }) => wurfSlug(values?.buchstabe),
    },
  },
  defaultItem: () => ({ status: 'geplant' }),
  fields: wurfFelder({
    linkHinweis: '',
    welpenFelder: [{ type: 'string', name: 'farbe', label: 'Farbe', options: [...dackelFarben] }],
  }),
};
