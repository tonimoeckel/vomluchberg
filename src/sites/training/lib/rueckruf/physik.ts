// Simulation of the "Rückruf" game (docs/plan/04-rueckruf-spiel.md §4.2–4.4). Pure: no DOM, no
// clock. The game calls `druecken()` on every press and `schritt()` with a fixed timestep, so the
// rules can be tested by playing them in a unit test.

import type { AblenkungArt, Level } from './level';

export const SCHRITT = 1 / 120;
export const SPRUNG = 700; // take-off speed, units/s
export const SCHWERKRAFT = 2000; // units/s²
export const PUFFER = 0.12; // a press up to this long before landing still jumps (jump buffering)
export const KOYOTE = 0.08; // a jump is still allowed this long after leaving the ground
/** Half the dog's hitbox along x (paws), smaller than the drawing. */
export const HALB = 14;

export type Phase = 'lauf' | 'bemerkt' | 'abgelenkt' | 'ziel' | 'weg';
export type Rueckmeldung = 'hier' | 'stolperer' | 'nass' | 'abgelenkt';

export interface Zustand {
  zeit: number;
  x: number;
  /** height of the paws above the stage floor */
  y: number;
  vy: number;
  amBoden: boolean;
  zuletztAmBoden: number;
  gedrueckt: number;
  phase: Phase;
  phaseSeit: number;
  /** index of the distraction the dog is busy with, or -1 */
  aktiv: number;
  /** per distraction: not yet, recalled in time, or missed */
  ablenkung: ('offen' | 'geschafft' | 'verpasst')[];
  /** per distraction: when the dog noticed it, or -1 */
  bemerktUm: number[];
  getroffen: boolean[];
  stolperBis: number;
  stolperer: number;
  meter: number;
  /** the last feedback, for the floating word above the dog */
  meldung: { art: Rueckmeldung; zeit: number } | null;
  /** first time a hint was shown (obstacle, distraction), for the one-off help lines */
  hinweis: { sprung: boolean; ruf: boolean };
  ende: null | { art: 'ziel' | 'weg'; zeit: number; wegen?: AblenkungArt };
  /** distance run, for the leg animation */
  weg: number;
}

export function neu(level: Level): Zustand {
  return {
    zeit: 0, x: 40, y: level.boden(40), vy: 0, amBoden: true, zuletztAmBoden: 0, gedrueckt: -Infinity,
    phase: 'lauf', phaseSeit: 0, aktiv: -1,
    ablenkung: level.ablenkungen.map(() => 'offen'), bemerktUm: level.ablenkungen.map(() => -1), getroffen: level.hindernisse.map(() => false),
    stolperBis: -Infinity, stolperer: 0, meter: 0, meldung: null, hinweis: { sprung: false, ruf: false },
    ende: null, weg: 0,
  };
}

const setzePhase = (z: Zustand, phase: Phase) => { z.phase = phase; z.phaseSeit = z.zeit; };

/** One press of the only button: recall while the dog is distracted, otherwise jump. */
export function druecken(z: Zustand): void {
  if (z.ende || z.phase === 'ziel' || z.phase === 'weg') return;
  if (z.phase === 'bemerkt') {
    z.ablenkung[z.aktiv] = 'geschafft';
    z.meldung = { art: 'hier', zeit: z.zeit };
    z.aktiv = -1;
    setzePhase(z, 'lauf');
    return;
  }
  if (z.phase === 'abgelenkt') return;
  z.gedrueckt = z.zeit;
}

/** Speed factor of the current phase. */
export function tempoFaktor(z: Zustand): number {
  if (z.phase === 'abgelenkt' || z.ende) return 0;
  if (z.phase === 'ziel') return Math.max(0, 1 - (z.zeit - z.phaseSeit) / 0.6);
  if (z.phase === 'weg') return 1.8;
  const stolpern = z.zeit < z.stolperBis ? 0.35 : 1;
  return (z.phase === 'bemerkt' ? 0.5 : 1) * stolpern;
}

export function schritt(z: Zustand, level: Level, dt = SCHRITT): void {
  if (z.ende) return;
  const { stufe } = level;
  z.zeit += dt;

  // Distractions: notice, recall window, pull.
  if (z.phase === 'lauf') {
    const i = level.ablenkungen.findIndex((a, k) => z.ablenkung[k] === 'offen' && z.x >= a.x - level.vorlauf);
    if (i >= 0) { z.aktiv = i; z.bemerktUm[i] = z.zeit; setzePhase(z, 'bemerkt'); z.hinweis.ruf = true; }
  } else if (z.phase === 'bemerkt' && z.zeit - z.phaseSeit > stufe.fenster) {
    z.ablenkung[z.aktiv] = 'verpasst';
    z.meter++;
    z.meldung = { art: 'abgelenkt', zeit: z.zeit };
    setzePhase(z, 'abgelenkt');
  } else if (z.phase === 'abgelenkt' && z.zeit - z.phaseSeit > 1) {
    if (z.meter >= stufe.geduld) setzePhase(z, 'weg');
    else { z.aktiv = -1; setzePhase(z, 'lauf'); }
  } else if (z.phase === 'weg' && z.zeit - z.phaseSeit > 1.4) {
    z.ende = { art: 'weg', zeit: z.zeit, wegen: level.ablenkungen[z.aktiv]?.art };
    return;
  } else if (z.phase === 'ziel' && z.zeit - z.phaseSeit > 1.2) {
    z.ende = { art: 'ziel', zeit: z.zeit };
    return;
  }

  // Run.
  const dx = stufe.tempo * tempoFaktor(z) * dt;
  z.x += dx;
  z.weg += dx;
  if (z.phase !== 'ziel' && z.phase !== 'weg' && z.x >= level.ziel) setzePhase(z, 'ziel');

  // Jump (buffered, with coyote time) and fall.
  const boden = level.boden(z.x);
  const darf = z.amBoden || z.zeit - z.zuletztAmBoden < KOYOTE;
  if (darf && z.zeit - z.gedrueckt <= PUFFER && z.phase !== 'ziel' && z.phase !== 'weg') {
    z.vy = SPRUNG;
    z.amBoden = false;
    z.zuletztAmBoden = -Infinity;
    z.gedrueckt = -Infinity;
    z.hinweis.sprung = true;
  }
  if (z.amBoden) {
    z.y = boden;
    z.zuletztAmBoden = z.zeit;
  } else {
    z.vy -= SCHWERKRAFT * dt;
    z.y += z.vy * dt;
    if (z.y <= boden && z.vy < 0) { z.y = boden; z.vy = 0; z.amBoden = true; z.zuletztAmBoden = z.zeit; }
  }

  // Obstacles: hitboxes smaller than the drawings (§4.3); a hit is a stumble, never the end.
  level.hindernisse.forEach((o, k) => {
    if (z.getroffen[k]) return;
    const rand = o.breite * 0.08;
    const ueberlappt = z.x + HALB > o.x + rand && z.x - HALB < o.x + o.breite - rand;
    if (ueberlappt && z.y - level.boden(z.x) < o.hoehe * 0.8) {
      z.getroffen[k] = true;
      z.stolperer++;
      const nass = o.art === 'bach' || o.art === 'pfuetze';
      z.stolperBis = z.zeit + (o.art === 'bach' ? 0.9 : 0.5);
      z.meldung = { art: nass ? 'nass' : 'stolperer', zeit: z.zeit };
    }
  });
}

export interface Wertung {
  pfoten: number;
  geschafft: number;
  ablenkungen: number;
  stolperer: number;
  sekunden: number;
}

/** Rückruf-Qualität: distractions 60 %, stumbles 25 %, time 15 %; 5 paws need every recall. */
export function wertung(z: Zustand, level: Level): Wertung {
  const geschafft = z.ablenkung.filter((a) => a === 'geschafft').length;
  const n = level.ablenkungen.length;
  const sekunden = Math.round(z.ende?.zeit ?? z.zeit);
  const basis = { geschafft, ablenkungen: n, stolperer: z.stolperer, sekunden };
  if (z.ende?.art !== 'ziel') return { pfoten: 0, ...basis };
  const ideal = level.ziel / level.stufe.tempo;
  const zeit = Math.min(Math.max((ideal / (z.ende.zeit - 1.2) - 0.7) / 0.3, 0), 1);
  const punkte = 0.6 * (n ? geschafft / n : 1) + 0.25 * Math.max(0, 1 - z.stolperer / 4) + 0.15 * zeit;
  let pfoten = Math.min(5, Math.max(1, Math.round(punkte * 5)));
  if (geschafft < n) pfoten = Math.min(pfoten, 4);
  return { pfoten, ...basis };
}
