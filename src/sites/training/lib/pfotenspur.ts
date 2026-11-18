// The paw trail over the start page's survey sketch: prints of a trotting dog along a route,
// computed at build time. Pure: the component only places one paw symbol per print and gives it its
// delay; the walking itself is a CSS opacity keyframe (global.css, .karte-pfoten).
// Coordinates are viewBox units of the map, y pointing down, angles in degrees (0 = east).

import { zufall } from './karte';

/** The one paw shape of the site (pad and four toes, toes pointing east, about 16 x 16 units round
 * the origin). Karte.astro uses it as an SVG path, the page trails (Pfotenspur.astro) as a CSS mask. */
export const PFOTE = 'M-7.1 0a4.4 5.1 0 1 0 8.7 0a4.4 5.1 0 1 0-8.7 0M2 -5.8a2 2 0 1 0 3.9 0a2 2 0 1 0-3.9 0M4.5 -2.1a2 2 0 1 0 3.9 0a2 2 0 1 0-3.9 0M4.5 2.1a2 2 0 1 0 3.9 0a2 2 0 1 0-3.9 0M2 5.8a2 2 0 1 0 3.9 0a2 2 0 1 0-3.9 0';
/** The paw as a CSS mask image (data URI), for HTML prints. */
export const PFOTE_MASKE = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='-8 -8 17 16'><path d='${PFOTE}'/></svg>`)}")`;

export interface Punkt {
  x: number;
  y: number;
}

export interface Pfote extends Punkt {
  /** walking direction at the print (degrees, 0 = east, clockwise because y points down) */
  winkel: number;
  seite: 'links' | 'rechts';
  /** seconds after the first print of the route */
  zeit: number;
}

export interface SpurOptionen {
  /** mean distance between two prints along the route */
  schritt?: number;
  /** distance of a print from the route, to the left or the right */
  versatz?: number;
  /** most prints per route (keeps the SVG small) */
  hoechstens?: number;
  /** the trot: the two alternating intervals between prints, in seconds (short, long) */
  takt?: [number, number];
  /** random turn of a print, in degrees either way of the walking direction (a puppy wobbles more) */
  wackeln?: number;
  seed?: number;
}

const rund = (v: number) => Math.round(v * 10) / 10;

/** Total length of a polyline. */
export function laenge(linie: Punkt[]): number {
  let l = 0;
  for (let i = 1; i < linie.length; i++) l += Math.hypot(linie[i].x - linie[i - 1].x, linie[i].y - linie[i - 1].y);
  return l;
}

/** The point and the unit tangent at arc length s along a polyline (clamped to its ends). */
export function punktBei(linie: Punkt[], s: number): { p: Punkt; t: Punkt } {
  let rest = Math.max(0, s);
  for (let i = 1; i < linie.length; i++) {
    const a = linie[i - 1], b = linie[i];
    const l = Math.hypot(b.x - a.x, b.y - a.y);
    if (l === 0) continue;
    if (rest <= l || i === linie.length - 1) {
      const f = Math.min(1, rest / l);
      return { p: { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f }, t: { x: (b.x - a.x) / l, y: (b.y - a.y) / l } };
    }
    rest -= l;
  }
  return { p: linie[0], t: { x: 1, y: 0 } };
}

/**
 * Prints along a route: a stride that alternates a little longer and shorter, left and right of the
 * route by `versatz`, each turned to the walking direction (the tangent, averaged over a short
 * stretch so corners of the polyline do not jerk), with a small seeded wobble. The times follow a
 * trot (short, long, short, long …), not a march.
 */
export function pfotenspur(route: Punkt[], optionen: SpurOptionen = {}): Pfote[] {
  const { schritt = 34, versatz = 6, hoechstens = 12, takt = [0.3, 0.5], wackeln = 5, seed = 1 } = optionen;
  const r = zufall(seed);
  const gesamt = laenge(route);
  const spur: Pfote[] = [];
  let s = schritt / 2;
  let zeit = 0;
  let links = r() < 0.5;
  for (let i = 0; i < hoechstens && s <= gesamt - schritt / 4; i++) {
    const { p } = punktBei(route, s);
    const vor = punktBei(route, s + schritt / 3).p, zurueck = punktBei(route, s - schritt / 3).p;
    const dl = Math.hypot(vor.x - zurueck.x, vor.y - zurueck.y) || 1;
    const t = { x: (vor.x - zurueck.x) / dl, y: (vor.y - zurueck.y) / dl };
    // Left of the walking direction is (t.y, -t.x) when y points down.
    const seite = links ? 1 : -1;
    const v = versatz * (0.85 + r() * 0.3);
    const winkel = (Math.atan2(t.y, t.x) * 180) / Math.PI + (r() - 0.5) * 2 * wackeln - seite * 4;
    spur.push({ x: rund(p.x + t.y * v * seite), y: rund(p.y - t.x * v * seite), winkel: Math.round(winkel), seite: links ? 'links' : 'rechts', zeit: Math.round(zeit * 100) / 100 });
    s += schritt * (i % 2 === 0 ? 0.92 : 1.08) * (0.94 + r() * 0.12);
    zeit += takt[i % 2] * (0.9 + r() * 0.2);
    links = !links;
  }
  return spur;
}

/**
 * A dog sitting at `p`, facing `winkel`: the two front paws side by side, the hind paws a little behind
 * and wider, turned out. `abstand` is the gap between the front paws (the hind paws scale with it).
 */
export function sitzen(p: Punkt, winkel: number, abstand = 12): Pfote[] {
  const b = (winkel * Math.PI) / 180;
  const t = { x: Math.cos(b), y: Math.sin(b) }, l = { x: t.y, y: -t.x };
  const bei = (vor: number, quer: number, dreh: number, seite: Pfote['seite']): Pfote => ({
    x: rund(p.x + t.x * vor + l.x * quer),
    y: rund(p.y + t.y * vor + l.y * quer),
    winkel: Math.round(winkel + dreh),
    seite,
    zeit: 0,
  });
  const a = abstand / 2;
  return [bei(-abstand * 1.6, a * 2.1, -14, 'links'), bei(-abstand * 1.6, -a * 2.1, 14, 'rechts'), bei(0, a, -3, 'links'), bei(0, -a, 3, 'rechts')];
}
