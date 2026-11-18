// Elevation profile of the survey map's forest track for the "Rückruf" game
// (docs/plan/04-rueckruf-spiel.md §4.1). Pure: samples `gelaende()` from lib/karte.ts along the
// track by arc length, so the level is the site's own map seen from the side.

import { gelaende, type KarteOptionen } from '../karte';

export interface Profil {
  /** heights along the track, evenly spaced by arc length, normalised to 0..1 */
  hoehen: number[];
  /** where the track crosses the Müglitz, as a fraction 0..1 of the track length */
  bach: number;
  /** a cut through the summit (west to east), normalised to 0..1: the Luchberg in the background */
  berg: number[];
}

type P = [number, number];

const bezier = (a: P, b: P, c: P, d: P, t: number): P => {
  const u = 1 - t;
  const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
  return [k[0] * a[0] + k[1] * b[0] + k[2] * c[0] + k[3] * d[0], k[0] * a[1] + k[1] * b[1] + k[2] * c[1] + k[3] * d[1]];
};

/** Points along the track: M p0 C p1 p2 p3 S p4 p5 (the S control point mirrors p2 about p3). */
export function wegPunkte(weg: P[], proSegment = 200): P[] {
  const [p0, p1, p2, p3, p4, p5] = weg;
  const spiegel: P = [2 * p3[0] - p2[0], 2 * p3[1] - p2[1]];
  const punkte: P[] = [];
  for (let i = 0; i <= proSegment; i++) punkte.push(bezier(p0, p1, p2, p3, i / proSegment));
  for (let i = 1; i <= proSegment; i++) punkte.push(bezier(p3, spiegel, p4, p5, i / proSegment));
  return punkte;
}

const normiert = (werte: number[]) => {
  const min = Math.min(...werte), max = Math.max(...werte);
  return werte.map((v) => (max > min ? (v - min) / (max - min) : 0));
};

const geglaettet = (werte: number[], radius: number) =>
  werte.map((_, i) => {
    let summe = 0, n = 0;
    for (let j = Math.max(0, i - radius); j <= Math.min(werte.length - 1, i + radius); j++) { summe += werte[j]; n++; }
    return summe / n;
  });

export function profil(proben = 400, optionen: KarteOptionen = {}): Profil {
  const g = gelaende(optionen);
  const punkte = wegPunkte(g.weg);
  // Cumulative arc length, then resample evenly.
  const laengen = [0];
  for (let i = 1; i < punkte.length; i++) laengen.push(laengen[i - 1] + Math.hypot(punkte[i][0] - punkte[i - 1][0], punkte[i][1] - punkte[i - 1][1]));
  const gesamt = laengen[laengen.length - 1];
  const gleichmaessig: P[] = [];
  let j = 1;
  for (let i = 0; i < proben; i++) {
    const s = (gesamt * i) / (proben - 1);
    while (j < laengen.length - 1 && laengen[j] < s) j++;
    const t = (s - laengen[j - 1]) / (laengen[j] - laengen[j - 1] || 1);
    gleichmaessig.push([punkte[j - 1][0] + (punkte[j][0] - punkte[j - 1][0]) * t, punkte[j - 1][1] + (punkte[j][1] - punkte[j - 1][1]) * t]);
  }
  const hoehen = geglaettet(normiert(gleichmaessig.map(([x, y]) => g.hoeheBei(x, y))), 4);
  // The crossing: the first sample east of the valley floor.
  const index = gleichmaessig.findIndex(([x, y]) => x >= g.talX(y));
  const bach = index < 0 ? 0.85 : index / (proben - 1);
  const berg = geglaettet(normiert(Array.from({ length: 160 }, (_, i) => g.hoeheBei((g.breite * i) / 159, g.gipfel.y))), 2);
  return { hoehen, bach, berg };
}
