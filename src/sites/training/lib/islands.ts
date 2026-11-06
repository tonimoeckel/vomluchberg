/**
 * Registry of every region the Tina editor updates live on the training site, served by
 * pages/tina-island/[name].ts. Only this site's components end up in its worker.
 */
import type { IslandRegistry } from '@tinacms/astro/experimental';
import type { QueryResult } from '@tinacms/astro/data';
import type { TrainingConfigQuery } from '../../../../tina/__generated__/types';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { getConfig } from './data';
import { detailIslands } from './detailseiten';

const config = (d: unknown) => ({ config: (d as QueryResult<TrainingConfigQuery>).data?.trainingConfig });

export const islands = {
  ...detailIslands,
  global: { fetch: () => getConfig(), component: Header, wrapper: { tag: 'div' }, propsFromData: config },
  'global-footer': { fetch: () => getConfig(), component: Footer, wrapper: { tag: 'div' }, propsFromData: config },
} satisfies IslandRegistry;
