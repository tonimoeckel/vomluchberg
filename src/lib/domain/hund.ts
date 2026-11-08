/** Domain rules for dogs ("Hunde"). Pure: shared by the site and the Tina admin schema. */
import { formatDatum } from './datum';
import type { Seo } from './seo';

/** A category option: value stored in the CMS, label shown as group title and in the form. */
export interface Kategorie { value: string; label: string }

/** Site-specific part of the dog rules (categories, URLs, SEO). Everything else is shared. */
export interface HundRegelConfig<K extends readonly Kategorie[] = readonly Kategorie[]> {
  /** Categories in display order – single source for the CMS options, labels and grouping. */
  kategorien: K;
  /** Category a dog without one counts as (label fallback). */
  standardKategorie: K[number]['value'];
  /** Categories offered by the "Hunde" block besides "alle". */
  blockKategorien: readonly K[number]['value'][];
  /** Categories whose dogs show no sex badge. */
  ohneGeschlecht: readonly K[number]['value'][];
  /** List page of all dogs; detail pages live below it. */
  listeUrl: string;
  /** Last sentence of a dog's meta description, e.g. "Rottweiler vom Luchberg." */
  seoSuffix: string;
}

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

/** Dogs in memoriam are shown slightly desaturated. */
export const istErinnerung = (hund: HundInfo) => hund.kategorie === 'erinnerung';

/** Ascending by "reihenfolge"; dogs without one go to position 99. */
export const sortiereHunde = <T extends { reihenfolge?: number | null }>(hunde: readonly T[]) =>
  [...hunde].sort((a, b) => (a.reihenfolge ?? 99) - (b.reihenfolge ?? 99));

const alle = 'alle';

export interface HundeGruppe<T> { kategorie: string; titel: string | null; hunde: T[] }

/** The dog rules of one site (categories, URLs, block choices, SEO) built from its config. */
export function hundRegeln<const K extends readonly Kategorie[]>(config: HundRegelConfig<K>) {
  const { kategorien, standardKategorie, blockKategorien, ohneGeschlecht, listeUrl, seoSuffix } = config;
  const ohne = ohneGeschlecht as readonly string[];
  const imBlock = blockKategorien as readonly string[];
  return {
    kategorien,
    /** Label of a category; a missing category counts as the standard category. */
    kategorieLabel: (kategorie?: string | null) =>
      kategorien.find((k) => k.value === (kategorie ?? standardKategorie))?.label ?? '',
    /** Sex shown on card and detail page; none for the categories in `ohneGeschlecht`. */
    geschlechtBadge: (hund: HundInfo): Geschlecht | null =>
      hund.kategorie && ohne.includes(hund.kategorie) ? null : (geschlechter.find((g) => g.value === hund.geschlecht) ?? null),
    hundeListeUrl: listeUrl,
    hundUrl: (slug: string) => `${listeUrl}/${slug}`,
    /** Choices of the "Hunde" block: all dogs grouped by category, or a single category. */
    hundeBlockAuswahl: [
      { value: alle, label: 'Alle (gruppiert)' },
      ...kategorien.filter((k) => imBlock.includes(k.value)),
    ],
    /**
     * Dogs for the "Hunde" block. "alle" (default): one titled group per category in display order,
     * empty ones dropped. A single category: one untitled group plus a link to all dogs.
     */
    hundeUebersicht<T extends { kategorie?: string | null }>(hunde: readonly T[], auswahl?: string | null) {
      const inKategorie = (k: string) => hunde.filter((h) => h.kategorie === k);
      if (auswahl && auswahl !== alle) {
        const gruppen: HundeGruppe<T>[] = [{ kategorie: auswahl, titel: null, hunde: inKategorie(auswahl) }];
        return { gruppen, zeigeAlleLink: true };
      }
      const gruppen: HundeGruppe<T>[] = kategorien
        .map((k) => ({ kategorie: k.value, titel: k.label, hunde: inKategorie(k.value) }))
        .filter((g) => g.hunde.length);
      return { gruppen, zeigeAlleLink: false };
    },
    hundSeo: (hund: { name: string; eltern?: string | null; bild?: string | null }): Seo => ({
      title: hund.name,
      description: `${hund.name}${hund.eltern ? ' – ' + hund.eltern : ''}. ${seoSuffix}`,
      image: hund.bild ?? null,
    }),
  };
}

/** Rules of the Rottweiler site (luchberg). */
export const rottweilerHunde = hundRegeln({
  kategorien: [
    { value: 'zucht', label: 'Unsere Rottweiler' },
    { value: 'aufzucht', label: 'Zur Aufzucht bei uns' },
    { value: 'rudel', label: 'Weitere Rudelmitglieder' },
    { value: 'erinnerung', label: 'In Erinnerung' },
  ],
  standardKategorie: 'zucht',
  blockKategorien: ['zucht', 'rudel'],
  ohneGeschlecht: ['rudel'],
  listeUrl: '/hunde',
  seoSuffix: 'Rottweiler vom Luchberg.',
});

export const {
  kategorien: hundKategorien,
  kategorieLabel,
  geschlechtBadge,
  hundeListeUrl,
  hundUrl,
  hundeBlockAuswahl,
  hundeUebersicht,
  hundSeo,
} = rottweilerHunde;

type Lebensdaten = { geboren?: string | null; verstorben?: string | null };

/** Detail page: "06.06.2018 – 19.12.2025" ("verstorben" is free text); null without a birth date. */
export const lebensspanne = (hund: Lebensdaten) =>
  hund.geboren ? formatDatum(hund.geboren) + (hund.verstorben ? ` – ${hund.verstorben}` : '') : null;

/** Card: "WT 06.06.2018" and "– 19.12.2025", each shown on its own when set. */
export const lebensdatenKarte = (hund: Lebensdaten) => ({
  wurftag: hund.geboren ? `WT ${formatDatum(hund.geboren)}` : null,
  verstorben: hund.verstorben ? `– ${hund.verstorben}` : null,
});
