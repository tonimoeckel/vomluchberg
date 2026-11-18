// Levels of the "Rückruf" game (docs/plan/04-rueckruf-spiel.md §4). Pure and deterministic: the
// same level always has the same terrain, obstacles and distractions, so it is fair to replay.
// World units: the stage is 300 units high, the dog is about 60 long, x runs along the track.

import { zufall } from '../karte';
import type { Profil } from './profil';

export type StufeId = 'welpe' | 'junghund' | 'pruefung';
export type HindernisArt = 'wurzel' | 'stamm' | 'pfuetze' | 'bach';
export type AblenkungArt = 'reh' | 'eichhoernchen' | 'jogger' | 'hund' | 'wurst';

export interface Stufe {
  id: StufeId;
  name: string;
  /** the offer this level stands for (link on the finish screen) */
  angebot: { slug: string; label: string };
  /** intended duration without mistakes, in seconds */
  dauer: number;
  /** running speed, units per second */
  tempo: number;
  ablenkungen: number;
  hindernisse: number;
  /** how long the recall window stays open after the dog notices a distraction, in seconds */
  fenster: number;
  /** missed recalls until the dog runs off */
  geduld: number;
  seed: number;
}

export const stufen: Record<StufeId, Stufe> = {
  welpe: { id: 'welpe', name: 'Welpe', angebot: { slug: 'welpenkurs', label: 'Welpenkurs' }, dauer: 45, tempo: 200, ablenkungen: 3, hindernisse: 7, fenster: 1.1, geduld: 3, seed: 5 },
  junghund: { id: 'junghund', name: 'Junghund', angebot: { slug: 'basistraining', label: 'Basistraining' }, dauer: 60, tempo: 240, ablenkungen: 6, hindernisse: 12, fenster: 0.85, geduld: 3, seed: 11 },
  pruefung: { id: 'pruefung', name: 'Prüfung', angebot: { slug: 'einzeltraining', label: 'Einzeltraining' }, dauer: 80, tempo: 285, ablenkungen: 9, hindernisse: 20, fenster: 0.65, geduld: 2, seed: 23 },
};

export const stufenIds = Object.keys(stufen) as StufeId[];

export const istStufe = (id: unknown): id is StufeId => typeof id === 'string' && (stufenIds as string[]).includes(id);

export interface Hindernis { art: HindernisArt; x: number; breite: number; hoehe: number }
export interface Ablenkung { art: AblenkungArt; x: number }

export interface Level {
  stufe: Stufe;
  laenge: number;
  /** the dog sits down here, in front of you */
  ziel: number;
  /** the Müglitz: start of the water */
  bachX: number;
  hindernisse: Hindernis[];
  ablenkungen: Ablenkung[];
  /** ground height (units above the stage floor) at x */
  boden: (x: number) => number;
  /** the Luchberg cut for the background, 0..1 */
  berg: number[];
  /** distance ahead of a distraction at which the dog notices it */
  vorlauf: number;
}

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
/** No obstacle and no distraction in the first seconds. */
export const FREI_SEKUNDEN = 3;

export function level(id: StufeId, profil: Profil): Level {
  const stufe = stufen[id];
  const laenge = Math.round(stufe.tempo * stufe.dauer);
  const ziel = laenge - 260;
  const r = zufall(stufe.seed);
  const h = profil.hoehen;
  const boden = (x: number) => {
    const t = Math.min(Math.max(x / laenge, 0), 1) * (h.length - 1);
    const i = Math.floor(t), f = t - i;
    const a = h[i], b = h[Math.min(i + 1, h.length - 1)];
    // Smoothstep between samples: no kinks the dog could trip on.
    return SOCKEL + (a + (b - a) * f * f * (3 - 2 * f)) * RELIEF;
  };
  // The crossing of the map, but always with room before the finish.
  const bachX = Math.round(Math.min(profil.bach * laenge, ziel - 700));
  const vorlauf = stufe.tempo * 1.2;
  const start = stufe.tempo * FREI_SEKUNDEN;

  // Distractions: evenly spread with jitter, before the stream. Each one reserves a zone in which
  // no obstacle may lie, so the button always means "recall" there (§4.2).
  const arten: AblenkungArt[] = ['reh', 'eichhoernchen', 'jogger', 'hund', 'wurst'];
  const ablenkungen: Ablenkung[] = [];
  const spanne = bachX - 500 - start - vorlauf;
  for (let i = 0; i < stufe.ablenkungen; i++) {
    const x = start + vorlauf + (spanne * (i + 0.5 + (r() - 0.5) * 0.5)) / stufe.ablenkungen;
    ablenkungen.push({ art: arten[(i + stufe.seed) % arten.length], x: Math.round(x) });
  }
  const gesperrt: [number, number][] = [
    ...ablenkungen.map((a): [number, number] => [a.x - vorlauf - stufe.tempo * 0.6, a.x + 160]),
    [bachX - stufe.tempo * 1.2, bachX + masse.bach.breite + stufe.tempo * 1.2],
    [ziel - stufe.tempo * 1.5, laenge],
  ];
  const frei = (von: number, bis: number) => gesperrt.every(([a, b]) => bis < a || von > b);

  // Obstacles: random positions in the free stretches, at least ~1 s apart.
  const abstand = stufe.tempo * 1.05;
  const hindernisse: Hindernis[] = [{ art: 'bach', x: bachX, ...masse.bach }];
  const auswahl: HindernisArt[] = ['wurzel', 'stamm', 'pfuetze', 'wurzel', 'stamm'];
  for (let versuch = 0; versuch < 400 && hindernisse.length < stufe.hindernisse + 1; versuch++) {
    const art = auswahl[Math.floor(r() * auswahl.length)];
    const x = Math.round(start + r() * (ziel - start));
    const m = masse[art];
    if (!frei(x, x + m.breite)) continue;
    if (hindernisse.some((o) => Math.abs(o.x - x) < abstand + o.breite)) continue;
    hindernisse.push({ art, x, ...m });
  }
  hindernisse.sort((a, b) => a.x - b.x);
  return { stufe, laenge, ziel, bachX, hindernisse, ablenkungen, boden, berg: profil.berg, vorlauf };
}
