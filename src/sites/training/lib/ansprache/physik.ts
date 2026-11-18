// Simulation of the "Ansprache" game. Pure: no DOM, no clock. You and your dog run the forest
// track together; one input jumps (both of you, at the same spot), the other speaks to the dog.
// When the dog notices a distraction, you have a short window to reach it; too late and it is gone,
// which ends the run. Obstacles only cost points. The game calls `springen()` / `ansprechen()` on
// input and `schritt()` with a fixed timestep, so the rules can be played in unit tests.

import { zufall } from '../karte';
import { ablenkungArten, hindernisArten, masse, schwierigkeit, type AblenkungArt, type HindernisArt, type Welt } from './strecke';

export const SCHRITT = 1 / 120;
export const SPRUNG = 700; // take-off speed, units/s
export const SCHWERKRAFT = 2000; // units/s²
export const PUFFER = 0.12; // a press up to this long before landing still jumps (jump buffering)
export const KOYOTE = 0.08; // a jump is still allowed this long after leaving the ground
/** Half the dog's hitbox along x (paws), smaller than the drawing. */
export const HALB = 14;
/** You run this far behind your dog. */
export const ABSTAND = 82;
/** The dog notices a distraction this far ahead (it is on screen by then, also on a phone). */
export const VORLAUF = 270;
/** Entities are created this far ahead of the dog. */
const HORIZONT = 2400;
/** Units per metre, for the distance shown. */
export const EINHEIT_PRO_METER = 20;

export type Rueckmeldung = 'fein' | 'ja' | 'stolperer' | 'nass';

export interface Hindernis { art: HindernisArt; x: number; breite: number; hoehe: number; getroffen: boolean; geschafft: boolean }
export interface Ablenkung { art: AblenkungArt; x: number; status: 'offen' | 'bemerkt' | 'geschafft' | 'verpasst'; bemerktUm: number; fenster: number }

interface Koerper { y: number; vy: number; amBoden: boolean }

export interface Zustand {
  zeit: number;
  /** the dog */
  x: number;
  hund: Koerper;
  zuletztAmBoden: number;
  gedrueckt: number;
  /** you, ABSTAND behind; you take off where the dog took off */
  mensch: Koerper;
  absprung: number[];
  hindernisse: Hindernis[];
  ablenkungen: Ablenkung[];
  aktiv: Ablenkung | null;
  stolperBis: number;
  stolperer: number;
  gemeistert: number;
  punkte: number;
  /** distance run, for the leg animation */
  weg: number;
  /** distance run together (without the dog's escape), for the metres */
  strecke: number;
  meldung: { art: Rueckmeldung; zeit: number } | null;
  /** last time you spoke to the dog, for the speech bubble */
  gerufen: number;
  hinweis: { sprung: boolean; ansprache: boolean };
  /** the dog runs off after the distraction it was not reached for */
  wegSeit: number;
  /** where the dog ran off (you stop there) */
  wegAb: number;
  ende: null | { zeit: number; wegen: AblenkungArt };
  // spawning
  zufall: () => number;
  naechsteAblenkung: number;
  naechstesHindernis: number;
  naechsterBach: number;
}

export function neu(welt: Welt, seed = 1): Zustand {
  const x = 40;
  const boden = welt.boden(x);
  return {
    zeit: 0, x, hund: { y: boden, vy: 0, amBoden: true }, zuletztAmBoden: 0, gedrueckt: -Infinity,
    mensch: { y: welt.boden(x - ABSTAND), vy: 0, amBoden: true }, absprung: [],
    hindernisse: [], ablenkungen: [], aktiv: null,
    stolperBis: -Infinity, stolperer: 0, gemeistert: 0, punkte: 0, weg: 0, strecke: 0,
    meldung: null, gerufen: -Infinity, hinweis: { sprung: false, ansprache: false },
    wegSeit: -1, wegAb: 0, ende: null,
    zufall: zufall(seed), naechsteAblenkung: 230 * 4, naechstesHindernis: 230 * 2.5, naechsterBach: 0,
  };
}

/** The jump input: buffered, applied in the next step. */
export function springen(z: Zustand): void {
  if (z.ende || z.wegSeit >= 0) return;
  z.gedrueckt = z.zeit;
}

/** The Ansprache: reaches the dog while it is distracted. Without a distraction it costs nothing. */
export function ansprechen(z: Zustand): 'fein' | 'ja' | null {
  if (z.ende || z.wegSeit >= 0) return null;
  z.gerufen = z.zeit;
  const a = z.aktiv;
  if (a && a.status === 'bemerkt') {
    a.status = 'geschafft';
    z.aktiv = null;
    z.gemeistert++;
    // The earlier, the better: 50 points plus up to 100 for speed.
    const rest = Math.max(0, 1 - (z.zeit - a.bemerktUm) / a.fenster);
    z.punkte += 50 + Math.round(100 * rest);
    z.meldung = { art: 'fein', zeit: z.zeit };
    z.hinweis.ansprache = true;
    return 'fein';
  }
  z.meldung = { art: 'ja', zeit: z.zeit };
  return 'ja';
}

export const tempo = (z: Zustand) => schwierigkeit(z.zeit).tempo * (z.zeit < z.stolperBis ? 0.4 : 1);

function erzeugen(z: Zustand, welt: Welt) {
  const d = schwierigkeit(z.zeit);
  const r = z.zufall;
  const bis = z.x + HORIZONT;
  // The Müglitz, wherever the track crosses it.
  while (welt.bach(z.naechsterBach) < bis + 1200) {
    z.hindernisse.push({ art: 'bach', x: Math.round(welt.bach(z.naechsterBach)), ...masse.bach, getroffen: false, geschafft: false });
    z.naechsterBach++;
  }
  const amBach = (von: number, bis: number) => z.hindernisse.some((o) => o.art === 'bach' && bis > o.x - 260 && von < o.x + o.breite + 260);
  // Distractions first (with some room ahead), obstacles keep out of their zones early on.
  while (z.naechsteAblenkung < bis + 600) {
    const x = Math.round(z.naechsteAblenkung);
    if (!amBach(x - VORLAUF, x + 120)) {
      z.ablenkungen.push({ art: ablenkungArten[Math.floor(r() * ablenkungArten.length)], x, status: 'offen', bemerktUm: -1, fenster: d.fenster });
    }
    z.naechsteAblenkung += d.tempo * d.ablenkungAbstand * (0.8 + r() * 0.5);
  }
  while (z.naechstesHindernis < bis) {
    const x = Math.round(z.naechstesHindernis);
    z.naechstesHindernis += d.tempo * d.hindernisAbstand * (0.8 + r() * 0.6);
    const art = hindernisArten[Math.floor(r() * hindernisArten.length)];
    const m = masse[art];
    if (amBach(x, x + m.breite)) continue;
    if (!d.ueberlappen && z.ablenkungen.some((a) => x + m.breite > a.x - VORLAUF - d.tempo * 0.6 && x < a.x + 160)) continue;
    z.hindernisse.push({ art, x, ...m, getroffen: false, geschafft: false });
    if (r() < d.doppelt) {
      const x2 = Math.round(x + d.tempo * 0.95);
      z.hindernisse.push({ art: 'wurzel', x: x2, ...masse.wurzel, getroffen: false, geschafft: false });
      z.naechstesHindernis = Math.max(z.naechstesHindernis, x2 + d.tempo * 0.9);
    }
  }
  z.hindernisse.sort((a, b) => a.x - b.x);
}

function fallen(k: Koerper, boden: number, dt: number) {
  if (k.amBoden) { k.y = boden; return; }
  k.vy -= SCHWERKRAFT * dt;
  k.y += k.vy * dt;
  if (k.y <= boden && k.vy < 0) { k.y = boden; k.vy = 0; k.amBoden = true; }
}

export function schritt(z: Zustand, welt: Welt, dt = SCHRITT): void {
  if (z.ende) return;
  z.zeit += dt;

  // Too late: the dog runs after the distraction, you stop.
  if (z.wegSeit >= 0) {
    z.x += 420 * dt;
    z.weg += 420 * dt;
    fallen(z.hund, welt.boden(z.x), dt);
    fallen(z.mensch, welt.boden(z.wegAb - ABSTAND), dt);
    if (z.zeit - z.wegSeit > 1.4) z.ende = { zeit: z.zeit, wegen: z.aktiv?.art ?? 'reh' };
    return;
  }

  erzeugen(z, welt);

  // Distractions: noticed, then the window for the Ansprache.
  if (!z.aktiv) {
    const a = z.ablenkungen.find((b) => b.status === 'offen' && z.x >= b.x - VORLAUF && z.x < b.x + 40);
    if (a) {
      a.status = 'bemerkt';
      a.bemerktUm = z.zeit;
      a.fenster = schwierigkeit(z.zeit).fenster;
      z.aktiv = a;
    }
  } else if (z.zeit - z.aktiv.bemerktUm > z.aktiv.fenster) {
    z.aktiv.status = 'verpasst';
    z.wegSeit = z.zeit;
    z.wegAb = z.x;
    return;
  }

  // Run.
  const dx = tempo(z) * dt;
  z.x += dx;
  z.weg += dx;
  z.strecke += dx;
  z.punkte += dx / EINHEIT_PRO_METER;

  // The dog's jump (buffered, with coyote time); you take off at the same spot.
  const darf = z.hund.amBoden || z.zeit - z.zuletztAmBoden < KOYOTE;
  if (darf && z.zeit - z.gedrueckt <= PUFFER) {
    z.hund.vy = SPRUNG;
    z.hund.amBoden = false;
    z.zuletztAmBoden = -Infinity;
    z.gedrueckt = -Infinity;
    z.absprung.push(z.x);
    z.hinweis.sprung = true;
  }
  fallen(z.hund, welt.boden(z.x), dt);
  if (z.hund.amBoden) z.zuletztAmBoden = z.zeit;
  const mx = z.x - ABSTAND;
  if (z.mensch.amBoden && z.absprung.length && mx >= z.absprung[0]) {
    z.absprung.shift();
    z.mensch.vy = SPRUNG;
    z.mensch.amBoden = false;
  }
  fallen(z.mensch, welt.boden(mx), dt);

  // Obstacles: hitboxes smaller than the drawings; a hit is a stumble, never the end.
  for (const o of z.hindernisse) {
    if (o.getroffen || o.geschafft) continue;
    const rand = o.breite * 0.08;
    if (z.x - HALB > o.x + o.breite - rand) {
      o.geschafft = true;
      z.punkte += 10;
      continue;
    }
    const ueberlappt = z.x + HALB > o.x + rand;
    if (ueberlappt && z.hund.y - welt.boden(z.x) < o.hoehe * 0.8) {
      o.getroffen = true;
      z.stolperer++;
      z.punkte = Math.max(0, z.punkte - 25);
      z.stolperBis = z.zeit + (o.art === 'bach' ? 0.9 : 0.5);
      z.meldung = { art: o.art === 'bach' || o.art === 'pfuetze' ? 'nass' : 'stolperer', zeit: z.zeit };
    }
  }

  // Forget what lies behind both of you.
  const hinten = z.x - ABSTAND - 500;
  if (z.hindernisse.length && z.hindernisse[0].x < hinten) z.hindernisse = z.hindernisse.filter((o) => o.x + o.breite > hinten);
  if (z.ablenkungen.length && z.ablenkungen[0].x < hinten) z.ablenkungen = z.ablenkungen.filter((a) => a.x > hinten || a === z.aktiv);
}

export interface Wertung {
  punkte: number;
  meter: number;
  gemeistert: number;
  stolperer: number;
  sekunden: number;
}

export function wertung(z: Zustand): Wertung {
  return {
    punkte: Math.round(z.punkte),
    meter: Math.round(z.strecke / EINHEIT_PRO_METER),
    gemeistert: z.gemeistert,
    stolperer: z.stolperer,
    sekunden: Math.round(z.ende?.zeit ?? z.zeit),
  };
}
