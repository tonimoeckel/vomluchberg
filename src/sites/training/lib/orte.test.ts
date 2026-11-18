import { describe, expect, it } from 'vitest';
import { karte } from './karte';
import { ORTE_STANDARD, ortPunkte, orte } from './orte';

interface Box { x0: number; y0: number; x1: number; y1: number }
const schneiden = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

describe('training places on the contact map', () => {
  it('falls back to the German defaults for empty labels', () => {
    expect(orte().map((o) => o.name)).toEqual(['Hundeplatz', 'Waldparkplatz', 'Bei euch vor Ort']);
    expect(orte({ hundeplatz: ' Vereinsplatz ', waldparkplatz: '', vorOrt: null }).map((o) => o.name)).toEqual([
      'Vereinsplatz',
      'Waldparkplatz',
      'Bei euch vor Ort',
    ]);
  });

  // Pin + label as a box, label width estimated from the type size (38px, ~0.56 em per character).
  const k = karte();
  const boxen = ortPunkte(k, ORTE_STANDARD).map((p) => {
    const breite = p.name.length * 38 * 0.56;
    const lx0 = p.anker === 'start' ? p.x + 28 : p.x - 28 - breite;
    const r = p.art === 'vorOrt' ? 64 : 18;
    return { p, box: { x0: Math.min(p.x - r, lx0), y0: Math.min(p.y - 57, p.y - r), x1: Math.max(p.x + r, lx0 + breite + 28), y1: p.y + (p.art === 'vorOrt' ? r : 0) } };
  });

  it('stays inside the square a phone shows and above the notebook card', () => {
    // The 3:2 sketch is cropped to a square on phones (xMidYMid slice): x from 200 to 1000.
    const rand = (k.breite - k.hoehe) / 2;
    for (const { box } of boxen) {
      expect(box.x0).toBeGreaterThan(rand + 10);
      expect(box.x1).toBeLessThan(k.breite - rand - 10);
      expect(box.y0).toBeGreaterThan(20);
      // The card overlaps the bottom ~130 units of the map on a phone.
      expect(box.y1).toBeLessThan(k.hoehe - 140);
    }
  });

  it('keeps clear of the Luchberg and Müglitz labels and of each other', () => {
    const luchberg = { x0: k.gipfel.x - 20, y0: k.gipfel.y - 60, x1: k.gipfel.x + 260, y1: k.gipfel.y + 60 };
    const mueglitz = { x0: k.fluss.x - 230, y0: k.fluss.y - 50, x1: k.fluss.x + 20, y1: k.fluss.y + 20 };
    for (const { p, box } of boxen) {
      expect(schneiden(box, luchberg), p.art).toBe(false);
      expect(schneiden(box, mueglitz), p.art).toBe(false);
    }
    for (let i = 0; i < boxen.length; i++)
      for (let j = i + 1; j < boxen.length; j++) expect(schneiden(boxen[i].box, boxen[j].box)).toBe(false);
  });
});
