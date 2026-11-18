// The endless track of the "Ansprache" game (docs/plan/04-rueckruf-spiel.md): the survey map's
// forest track seen from the side, walked back and forth, and the difficulty that rises with time
// until the game cannot be won any more. Pure: no DOM, no clock.

import type { Profil } from './profil';

export type HindernisArt = 'wurzel' | 'stamm' | 'pfuetze' | 'bach';
export type AblenkungArt = 'reh' | 'eichhoernchen' | 'jogger' | 'hund' | 'wurst';

export const hindernisArten: Exclude<HindernisArt, 'bach'>[] = ['wurzel', 'stamm', 'pfuetze'];
export const ablenkungArten: AblenkungArt[] = ['reh', 'eichhoernchen', 'jogger', 'hund', 'wurst'];

export const masse: Record<HindernisArt, { breite: number; hoehe: number }> = {
  wurzel: { breite: 34, hoehe: 14 },
  stamm: { breite: 48, hoehe: 26 },
  pfuetze: { breite: 54, hoehe: 4 },
  bach: { breite: 74, hoehe: 4 },
};

/** Terrain amplitude: the map is a sketch, the profile is exaggerated to be visible. */
export const RELIEF = 110;
/** Lowest ground line above the stage floor. */
export const SOCKEL = 34;
/** One pass along the map's track, in world units; then the track is walked back. */
export const ABSCHNITT = 12000;

export interface Welt {
  /** ground height (units above the stage floor) at x */
  boden: (x: number) => number;
  /** the Luchberg cut for the background, 0..1 */
  berg: number[];
  /** x of the n-th crossing of the Müglitz (n = 0, 1, …) */
  bach: (n: number) => number;
}

export function welt(profil: Profil): Welt {
  const h = profil.hoehen;
  const roh = (x: number) => {
    // Back and forth along the track, so the terrain never ends and never jumps.
    const runde = Math.floor(Math.max(x, 0) / ABSCHNITT);
    let t = (Math.max(x, 0) % ABSCHNITT) / ABSCHNITT;
    if (runde % 2 === 1) t = 1 - t;
    const s = t * (h.length - 1);
    const i = Math.floor(s), f = s - i;
    const a = h[i], b = h[Math.min(i + 1, h.length - 1)];
    return SOCKEL + (a + (b - a) * f * f * (3 - 2 * f)) * RELIEF;
  };
  const bach = (n: number) => n * ABSCHNITT + (n % 2 === 0 ? profil.bach : 1 - profil.bach) * ABSCHNITT;
  // A level ford around each crossing: the valley floor is steep, a jump over the stream must not
  // end early on the far bank.
  const furt = (x: number) => {
    const n = Math.round(x / ABSCHNITT - (Math.floor(x / ABSCHNITT) % 2 === 0 ? profil.bach : 1 - profil.bach));
    let naechste = bach(Math.max(n, 0));
    for (const k of [n - 1, n + 1]) if (k >= 0 && Math.abs(bach(k) - x) < Math.abs(naechste - x)) naechste = bach(k);
    return naechste + masse.bach.breite / 2;
  };
  const boden = (x: number) => {
    const mitte = furt(x);
    const d = Math.abs(x - mitte);
    if (d >= 420) return roh(x);
    const t = Math.max(0, (d - 220) / 200);
    const w = t * t * (3 - 2 * t);
    return roh(mitte) * (1 - w) + roh(x) * w;
  };
  return { boden, berg: profil.berg, bach };
}

export interface Schwierigkeit {
  /** running speed, units per second */
  tempo: number;
  /** how long the dog can still be reached after it noticed a distraction, in seconds */
  fenster: number;
  /** mean time between two distractions, in seconds */
  ablenkungAbstand: number;
  /** mean time between two obstacles, in seconds */
  hindernisAbstand: number;
  /** obstacles may lie where the dog is distracted (you have to jump and speak at once) */
  ueberlappen: boolean;
  /** chance of two obstacles right after each other */
  doppelt: number;
}

/**
 * Difficulty after `t` seconds. The window for the Ansprache shrinks from 1.25 s to 0.25 s: after
 * about two minutes it is shorter than a human reaction, so every run ends.
 */
export function schwierigkeit(t: number): Schwierigkeit {
  return {
    tempo: 230 + 190 * (1 - Math.exp(-t / 100)),
    fenster: Math.max(0.25, 1.25 * Math.exp(-t / 75)),
    ablenkungAbstand: Math.max(1.8, 7 * Math.exp(-t / 90)),
    hindernisAbstand: Math.max(0.85, 2 * Math.exp(-t / 120)),
    ueberlappen: t > 40,
    doppelt: t > 70 ? 0.3 : 0,
  };
}
