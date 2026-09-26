/** Domain rules for dogs ("Hunde"). Pure: shared by the site and the Tina admin schema. */
import { formatDatum } from './datum';
import type { Seo } from './seo';

/** Categories in display order – single source for the CMS options, labels and grouping. */
export const hundKategorien = [
  { value: 'zucht', label: 'Unsere Rottweiler' },
  { value: 'aufzucht', label: 'Zur Aufzucht bei uns' },
  { value: 'rudel', label: 'Weitere Rudelmitglieder' },
  { value: 'erinnerung', label: 'In Erinnerung' },
] as const;

/** Label of a category; a missing category counts as "zucht". */
export const kategorieLabel = (kategorie?: string | null) =>
  hundKategorien.find((k) => k.value === (kategorie ?? 'zucht'))?.label ?? '';

/** Sex options (dogs and puppies). */
export const geschlechter = [
  { value: 'huendin', label: 'Hündin' },
  { value: 'ruede', label: 'Rüde' },
] as const;

export type Geschlecht = (typeof geschlechter)[number];

/** "Rüde" / "Hündin"; empty when unknown. */
export const geschlechtLabel = (geschlecht?: string | null) =>
  geschlechter.find((g) => g.value === geschlecht)?.label ?? '';

type HundInfo = { kategorie?: string | null; geschlecht?: string | null };

/** Sex shown on card and detail page; none for the other pack members ("rudel"). */
export const geschlechtBadge = (hund: HundInfo): Geschlecht | null =>
  hund.kategorie === 'rudel' ? null : (geschlechter.find((g) => g.value === hund.geschlecht) ?? null);

/** Dogs in memoriam are shown slightly desaturated. */
export const istErinnerung = (hund: HundInfo) => hund.kategorie === 'erinnerung';

export const hundeListeUrl = '/hunde';
export const hundUrl = (slug: string) => `${hundeListeUrl}/${slug}`;

/** Ascending by "reihenfolge"; dogs without one go to position 99. */
export const sortiereHunde = <T extends { reihenfolge?: number | null }>(hunde: readonly T[]) =>
  [...hunde].sort((a, b) => (a.reihenfolge ?? 99) - (b.reihenfolge ?? 99));

const alle = 'alle';

/** Choices of the "Hunde" block: all dogs grouped by category, or a single category. */
export const hundeBlockAuswahl = [
  { value: alle, label: 'Alle (gruppiert)' },
  ...hundKategorien.filter((k) => k.value === 'zucht' || k.value === 'rudel'),
];

export interface HundeGruppe<T> { kategorie: string; titel: string | null; hunde: T[] }

/**
 * Dogs for the "Hunde" block. "alle" (default): one titled group per category in display order,
 * empty ones dropped. A single category: one untitled group plus a link to all dogs.
 */
export function hundeUebersicht<T extends { kategorie?: string | null }>(hunde: readonly T[], auswahl?: string | null) {
  const inKategorie = (k: string) => hunde.filter((h) => h.kategorie === k);
  if (auswahl && auswahl !== alle) {
    const gruppen: HundeGruppe<T>[] = [{ kategorie: auswahl, titel: null, hunde: inKategorie(auswahl) }];
    return { gruppen, zeigeAlleLink: true };
  }
  const gruppen: HundeGruppe<T>[] = hundKategorien
    .map((k) => ({ kategorie: k.value, titel: k.label, hunde: inKategorie(k.value) }))
    .filter((g) => g.hunde.length);
  return { gruppen, zeigeAlleLink: false };
}

type Lebensdaten = { geboren?: string | null; verstorben?: string | null };

/** Detail page: "06.06.2018 – 19.12.2025" ("verstorben" is free text); null without a birth date. */
export const lebensspanne = (hund: Lebensdaten) =>
  hund.geboren ? formatDatum(hund.geboren) + (hund.verstorben ? ` – ${hund.verstorben}` : '') : null;

/** Card: "WT 06.06.2018" and "– 19.12.2025", each shown on its own when set. */
export const lebensdatenKarte = (hund: Lebensdaten) => ({
  wurftag: hund.geboren ? `WT ${formatDatum(hund.geboren)}` : null,
  verstorben: hund.verstorben ? `– ${hund.verstorben}` : null,
});

export const hundSeo = (hund: { name: string; eltern?: string | null; bild?: string | null }): Seo => ({
  title: hund.name,
  description: `${hund.name}${hund.eltern ? ' – ' + hund.eltern : ''}. Rottweiler vom Luchberg.`,
  image: hund.bild ?? null,
});
