/**
 * Domain rules of the dachshund site (Rauhaardackel vom Luchberg). Pure: shared by the site and
 * the Tina admin schema. Builds on the shared dog and litter rules (hund.ts, wurf.ts).
 */
import { hundRegeln, lebensspanne } from './hund';
import { wurfUrlFuer } from './wurf';

/** Dog rules of the site: categories, /unsere-dackel URLs, SEO suffix. */
export const dackelHunde = hundRegeln({
  kategorien: [
    { value: 'zucht', label: 'Unsere Hündinnen' },
    { value: 'deckrude', label: 'Die Väter unserer Würfe' },
    { value: 'erinnerung', label: 'In Erinnerung' },
  ],
  standardKategorie: 'zucht',
  blockKategorien: ['zucht', 'deckrude'],
  ohneGeschlecht: [],
  listeUrl: '/unsere-dackel',
  seoSuffix: 'Rauhaardackel vom Luchberg.',
});

export const dackelKategorien = dackelHunde.kategorien;

/** Litters ("Würfe") are listed on /welpen – the word families search for. */
export const dackelWuerfe = wurfUrlFuer('/welpen');

/** Coat colours (dogs and puppies), in Karo's words. A fixed list keeps the cards consistent. */
export const dackelFarben = [
  { value: 'saufarben', label: 'saufarben' },
  { value: 'dunkelsaufarben', label: 'dunkelsaufarben' },
  { value: 'schoko-braun', label: 'schoko-braun' },
  { value: 'black-tan', label: 'black-tan' },
  { value: 'rot', label: 'rot' },
  { value: 'duerrlaubfarben', label: 'dürrlaubfarben' },
  { value: 'sonstige', label: 'sonstige' },
] as const;

/** Size classes (by chest girth). Without a value the site names no class. */
export const dackelGroessen = [
  { value: 'standard', label: 'Standard' },
  { value: 'zwerg', label: 'Zwerg' },
  { value: 'kaninchen', label: 'Kaninchen' },
] as const;

/** Coat types; a missing one counts as wire-haired (the site's breed). Fathers may differ (Pietri). */
export const dackelHaar = [
  { value: 'rauhaar', label: 'Rauhaar' },
  { value: 'kurzhaar', label: 'Kurzhaar' },
  { value: 'langhaar', label: 'Langhaar' },
] as const;

const label = (options: readonly { value: string; label: string }[], value?: string | null) =>
  options.find((o) => o.value === value)?.label ?? '';

/** "saufarben"; empty for unknown values and for "sonstige" (says nothing on a card). */
export const farbeLabel = (farbe?: string | null) => (farbe === 'sonstige' ? '' : label(dackelFarben, farbe));

/** "Standard-Rauhaardackel", "Zwerg-Kurzhaardackel"; just "Rauhaardackel" without a size class. */
export function dackelBezeichnung(hund: { groesse?: string | null; haar?: string | null }): string {
  const haar = label(dackelHaar, hund.haar) || 'Rauhaar';
  const groesse = label(dackelGroessen, hund.groesse);
  return `${groesse ? `${groesse}-` : ''}${haar}dackel`;
}

export interface DackelInfo {
  groesse?: string | null;
  haar?: string | null;
  farbe?: string | null;
  geboren?: string | null;
  verstorben?: string | null;
  eltern?: string | null;
  abstammung?: string | null;
  brustumfang?: string | null;
  gesundheit?: string | null;
  auswaertig?: boolean | null;
  besitzer?: string | null;
}

/** One row of a dog's profile; `feld` is the CMS field it comes from (click-to-edit). */
export interface SteckbriefZeile { feld: keyof DackelInfo; label: string; wert: string }

/** Profile rows of a dog's detail page, in display order; empty values are skipped. */
export function dackelSteckbrief(hund: DackelInfo): SteckbriefZeile[] {
  const zeilen: (SteckbriefZeile | null)[] = [
    { feld: 'groesse', label: 'Rasse', wert: dackelBezeichnung(hund) },
    { feld: 'farbe', label: 'Farbe', wert: farbeLabel(hund.farbe) },
    { feld: 'geboren', label: 'Wurftag', wert: lebensspanne(hund) ?? '' },
    { feld: 'eltern', label: 'Eltern', wert: hund.eltern ?? '' },
    { feld: 'abstammung', label: 'Abstammung', wert: hund.abstammung ?? '' },
    { feld: 'brustumfang', label: 'Brustumfang', wert: hund.brustumfang ?? '' },
    { feld: 'gesundheit', label: 'Gesundheit', wert: hund.gesundheit ?? '' },
    hund.auswaertig ? { feld: 'besitzer', label: 'Besitzer', wert: hund.besitzer ?? '' } : null,
  ];
  return zeilen.filter((z): z is SteckbriefZeile => !!z && z.wert.trim() !== '');
}

/** Short line under a dog's name on cards: "Standard-Rauhaardackel · saufarben". */
export const dackelKurzinfo = (hund: Pick<DackelInfo, 'groesse' | 'haar' | 'farbe'>) =>
  [dackelBezeichnung(hund), farbeLabel(hund.farbe)].filter(Boolean).join(' · ');

type WurfInfo = { titel: string; status?: string | null };

/**
 * Status line of the "Welpen" panel: the current litter first, then a planned one; without one the
 * config's `hinweis` (e.g. "Derzeit keine Welpen"), otherwise nothing.
 */
export function welpenStatus(wuerfe: readonly WurfInfo[], hinweis?: string | null): string | null {
  const aktuell = wuerfe.find((w) => w.status === 'aktuell');
  if (aktuell) return `Welpen sind da: ${aktuell.titel}`;
  const geplant = wuerfe.find((w) => w.status === 'geplant');
  if (geplant) return `In Planung: ${geplant.titel}`;
  return hinweis?.trim() || null;
}

export interface TextTeil { text: string; betont: boolean }

/**
 * Splits a heading at single asterisks: "Rauhaardackel, *groß geworden* mitten im Rudel." → the
 * starred part is shown in italics. An unmatched asterisk is kept as text.
 */
export function betonteTeile(text: string): TextTeil[] {
  const teile = text.split('*');
  if (teile.length % 2 === 0) return [{ text, betont: false }];
  return teile.map((t, i) => ({ text: t, betont: i % 2 === 1 })).filter((t) => t.text !== '');
}

/** Mail subject of an inquiry: "Anfrage Rauhaardackel" plus the chosen topic. */
export const anfrageBetreff = (thema: string) => `Anfrage Rauhaardackel${thema.trim() ? `: ${thema.trim()}` : ''}`;
