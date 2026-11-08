/**
 * Footer cross-links between the sites (docs/plan/03-betrieb.md O9): the target URL comes from the
 * site registry, and a site only links to targets that are live – never to a preview host.
 * Pure: the hint text is edited in each site's Tina settings (`querverweis`).
 */
import { sites, type SiteId } from '../sites/index';

export interface QuerverweisZiel { id: SiteId; name: string; url: string }

/** The live sites `von` links to, in its configured order. */
export function querverweisZiele(von: SiteId, registry: Record<string, { name: string; url?: string; live?: boolean; querverweise?: readonly string[] }> = sites): QuerverweisZiel[] {
  return (registry[von]?.querverweise ?? []).flatMap((id) => {
    const ziel = registry[id];
    return ziel?.live && ziel.url ? [{ id: id as SiteId, name: ziel.name, url: ziel.url }] : [];
  });
}
