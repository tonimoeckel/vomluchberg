/** Domain rules for litters ("Würfe"). Pure: shared by the site and the Tina admin schema. */
import type { Seo } from './seo';

/** Status options in CMS order. */
export const wurfStatus = [
  { value: 'geplant', label: 'In Planung' },
  { value: 'aktuell', label: 'Welpen sind da' },
  { value: 'vergangen', label: 'Abgeschlossen' },
] as const;

/** Label of a status; a missing status counts as "vergangen". */
export const statusLabel = (status?: string | null) =>
  wurfStatus.find((s) => s.value === (status ?? 'vergangen'))?.label ?? '';

const statusRang: Record<string, number> = { aktuell: 0, geplant: 1, vergangen: 2 };
const rang = (status?: string | null) => statusRang[status ?? 'vergangen'] ?? 3;

/** Current litters first, then planned, then past (missing status = past); newest letter first. */
export const sortiereWuerfe = <T extends { status?: string | null; buchstabe?: string | null }>(wuerfe: readonly T[]) =>
  [...wuerfe].sort((a, b) => rang(a.status) - rang(b.status) || (b.buchstabe ?? '').localeCompare(a.buchstabe ?? ''));

/** Filename of a litter, e.g. "C" → "c-wurf". */
export const wurfSlug = (buchstabe?: string | null) => `${(buchstabe || 'x').toLowerCase()}-wurf`;

/** URLs of a site's litter list (`listeUrl`) and its detail pages below it. */
export const wurfUrlFuer = (listeUrl: string) => ({
  wuerfeListeUrl: listeUrl,
  wurfUrl: (slug: string) => `${listeUrl}/${slug}`,
});

/** Rottweiler site (luchberg): /wuerfe. */
export const { wuerfeListeUrl, wurfUrl } = wurfUrlFuer('/wuerfe');

export const wurfSeo = (wurf: { titel: string; kurztext?: string | null; bild?: string | null }): Seo => ({
  title: `${wurf.titel} vom Luchberg`,
  description: wurf.kurztext ?? null,
  image: wurf.bild ?? null,
});
