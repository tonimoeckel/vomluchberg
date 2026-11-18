// The trail in the page margin of the sub pages: a dog walks down the right-hand margin while the
// visitor scrolls (Faehrte.astro, one CSS view timeline per print) and sits down at the end of the page.
// Pure and deterministic, computed at build time. Pixel units, y pointing down, x relative to the
// middle of the margin (the CSS squeezes x on narrow margins, see global.css .faehrte).
//
// The page height is unknown at build time, so the walk has a fixed length (the cap keeps the HTML
// small) and fades out at the bottom of its box; the end (a few steps and the sitting dog) is anchored
// to the bottom of the page separately.

import { pfotenspur, sitzen, type Pfote, type Punkt } from './pfotenspur';

export type FaehrteArt = 'hund' | 'welpe';

/** Which pages get the trail: the offers, their detail pages, "Über mich" and the inquiry. Not the start
 * page (its motion budget is the hero trail and the inquiry bar), not the legal pages, not the 404. */
export function faehrteArt(pfad: string): FaehrteArt | null {
  const p = pfad.replace(/\/+$/, '') || '/';
  if (p === '/angebote/welpenkurs') return 'welpe';
  if (p === '/angebote' || p.startsWith('/angebote/') || p === '/ueber-mich' || p === '/anfrage') return 'hund';
  return null;
}

export interface Faehrte {
  /** the walk from the top of the page down */
  weg: Pfote[];
  /** the last steps and the sitting dog, y measured from the top of a box of height `endeHoehe` at the page bottom */
  ende: Pfote[];
  endeHoehe: number;
}

/** A slow meander straight down: amplitude and wave length in px. */
export function maeander(laenge: number, weite: number, welle: number, start = 0, phase = 0): Punkt[] {
  const linie: Punkt[] = [];
  for (let y = 0; y <= laenge; y += 24) linie.push({ x: Math.round(Math.sin(((y / welle) * 2 + phase) * Math.PI) * weite * 10) / 10, y: start + y });
  return linie;
}

const ARTEN = {
  // An adult dog: a steady trot, prints 52 px apart, about 90 of them (≈ 4700 px of page).
  hund: { schritt: 52, versatz: 8, hoechstens: 90, wackeln: 6, weite: 9, welle: 1100, abstand: 13, seed: 11 },
  // A puppy: shorter steps, closer together, more wobble, a looser line; the same number of prints.
  welpe: { schritt: 34, versatz: 6, hoechstens: 90, wackeln: 16, weite: 13, welle: 640, abstand: 10, seed: 23 },
} as const;

export function faehrte(art: FaehrteArt): Faehrte {
  const a = ARTEN[art];
  const optionen = { schritt: a.schritt, versatz: a.versatz, wackeln: a.wackeln };
  const weg = pfotenspur(maeander(a.schritt * (a.hoechstens + 1), a.weite, a.welle, 40), { ...optionen, hoechstens: a.hoechstens, seed: a.seed });
  // The end: three steps coming in from above, then the dog sits facing down the page (towards the footer).
  const endeHoehe = 220;
  const sitz = { x: 0, y: endeHoehe - 70 };
  // The run-up stops short of the hind paws (they sit about 1.6 gaps behind the front paws).
  const bisHier = { x: 0, y: sitz.y - a.abstand * 2.6 };
  const anlauf = pfotenspur([{ x: a.weite, y: 0 }, { x: a.weite * 0.4, y: bisHier.y * 0.55 }, bisHier], { ...optionen, hoechstens: 3, seed: a.seed + 1 });
  return { weg, ende: [...anlauf, ...sitzen(sitz, 90, a.abstand)], endeHoehe };
}

/**
 * The 404 page: someone ran off. A gallop (quick, uneven beat) from the lower left of a box of
 * `breite` x `hoehe` px up across it and out over its right edge; the last prints lie outside the box
 * and are clipped, so on any screen the trail leaves the page on the right.
 */
export function abgehauen(breite = 1400, hoehe = 260): Pfote[] {
  const route: Punkt[] = [];
  for (let i = 0; i <= 20; i++) {
    const f = i / 20;
    route.push({ x: Math.round(f * (breite + 120)), y: Math.round(hoehe * (0.86 - 0.62 * f) + Math.sin(f * Math.PI * 3) * 18) });
  }
  return pfotenspur(route, { schritt: 46, versatz: 8, hoechstens: 34, wackeln: 9, takt: [0.12, 0.22], seed: 404 });
}
