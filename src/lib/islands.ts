/**
 * Registry of every region the Tina editor updates live.
 * While editing, the route /tina-island/[name] returns the re-rendered HTML.
 * Detail pages bring their own entry (src/lib/detailseiten.ts); header and footer are global.
 */
import type { IslandConfig, IslandRegistry } from '@tinacms/astro/experimental';
import type { QueryResult } from '@tinacms/astro/data';
import type { ConfigQuery } from '../../tina/__generated__/types';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { getConfig } from './data';
import { aktuelles, hunde, seiten, wuerfe, type Detailseite } from './detailseiten';

const eintrag = <N extends string>(d: Detailseite<N>) => ({ [d.name]: d.island }) as Record<N, IslandConfig>;

export const islands = {
  ...eintrag(seiten),
  ...eintrag(hunde),
  ...eintrag(wuerfe),
  ...eintrag(aktuelles),
  global: {
    fetch: () => getConfig(),
    component: Header,
    wrapper: { tag: 'div' },
    propsFromData: (d) => ({ config: (d as QueryResult<ConfigQuery>).data?.config }),
  },
  'global-footer': {
    fetch: () => getConfig(),
    component: Footer,
    wrapper: { tag: 'div' },
    propsFromData: (d) => ({ config: (d as QueryResult<ConfigQuery>).data?.config }),
  },
} satisfies IslandRegistry;
