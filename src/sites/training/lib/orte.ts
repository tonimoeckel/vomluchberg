// The three kinds of training places as pins on the contact map (Kontaktliste → Karte "orte").
// Symbolic, not real locations: fixed fractions of the viewBox, chosen to stay inside the part of the
// map a phone shows (the square crop of the 3:2 sketch), clear of the Luchberg and Müglitz labels and
// above the notebook card that overlaps the bottom of the map. Labels are editable in Tina
// (trainingConfig.kontakt.orte); empty fields fall back to the German defaults here.
import type { Karte } from './karte';

export type OrtArt = 'hundeplatz' | 'waldparkplatz' | 'vorOrt';

export interface Ort {
  art: OrtArt;
  name: string;
}

export interface OrtPunkt extends Ort {
  /** pin tip, in viewBox units */
  x: number;
  y: number;
  /** label goes to the right of the pin (start) or to its left (end) */
  anker: 'start' | 'end';
}

export const ORTE_STANDARD: Ort[] = [
  { art: 'hundeplatz', name: 'Hundeplatz' },
  { art: 'waldparkplatz', name: 'Waldparkplatz' },
  { art: 'vorOrt', name: 'Bei euch vor Ort' },
];

type OrteFelder = Partial<Record<OrtArt, string | null>> | null | undefined;

/** The three places with their labels: the Tina text where set, the default otherwise. */
export function orte(felder?: OrteFelder): Ort[] {
  return ORTE_STANDARD.map((o) => ({ art: o.art, name: felder?.[o.art]?.trim() || o.name }));
}

/** Positions as fractions of width and height (pin tip). */
const LAGE: Record<OrtArt, { fx: number; fy: number; anker: 'start' | 'end' }> = {
  hundeplatz: { fx: 0.24, fy: 0.24, anker: 'start' },
  waldparkplatz: { fx: 0.77, fy: 0.2, anker: 'end' },
  vorOrt: { fx: 0.64, fy: 0.72, anker: 'end' },
};

export function ortPunkte(k: Pick<Karte, 'breite' | 'hoehe'>, liste: Ort[] = ORTE_STANDARD): OrtPunkt[] {
  return liste.map((o) => {
    const l = LAGE[o.art];
    return { ...o, x: Math.round(k.breite * l.fx), y: Math.round(k.hoehe * l.fy), anker: l.anker };
  });
}
