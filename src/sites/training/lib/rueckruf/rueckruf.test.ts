import { describe, expect, it } from 'vitest';
import { profil } from './profil';
import { level, stufen, stufenIds, istStufe, type Level } from './level';
import { druecken, neu, schritt, wertung, HALB, SPRUNG, SCHWERKRAFT, type Zustand } from './physik';
import { statistik, wegZeile, zielZeile } from './texte';

const p = profil();

/** Plays a level: `ruft` decides whether distractions are recalled, `springt` whether obstacles are jumped. */
function spiele(l: Level, { ruft = true, springt = true } = {}): Zustand {
  const z = neu(l);
  const flug = (2 * SPRUNG) / SCHWERKRAFT;
  for (let i = 0; i < 120 * 300 && !z.ende; i++) {
    if (ruft && z.phase === 'bemerkt') druecken(z);
    if (springt && z.amBoden && z.phase === 'lauf') {
      const o = l.hindernisse.find((h, k) => !z.getroffen[k] && h.x + h.breite > z.x - HALB);
      if (o && o.x + o.breite / 2 - z.x <= (l.stufe.tempo * flug) / 2) druecken(z);
    }
    schritt(z, l);
  }
  return z;
}

describe('profile of the forest track', () => {
  it('is normalised and crosses the Müglitz in the east', () => {
    expect(Math.min(...p.hoehen)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...p.hoehen)).toBeLessThanOrEqual(1);
    expect(p.bach).toBeGreaterThan(0.6);
    expect(p.bach).toBeLessThan(0.95);
    // The valley is the low point of the track.
    const tief = p.hoehen.indexOf(Math.min(...p.hoehen)) / (p.hoehen.length - 1);
    expect(Math.abs(tief - p.bach)).toBeLessThan(0.1);
  });
  it('cuts through the summit for the background', () => {
    expect(Math.max(...p.berg)).toBeGreaterThan(0.95);
    expect(p.berg.indexOf(Math.max(...p.berg)) / p.berg.length).toBeCloseTo(0.36, 1);
  });
});

describe('levels', () => {
  it('are deterministic', () => {
    for (const id of stufenIds) {
      const a = level(id, p), b = level(id, p);
      expect(a.hindernisse).toEqual(b.hindernisse);
      expect(a.ablenkungen).toEqual(b.ablenkungen);
    }
  });
  it('place every distraction and obstacle, the stream before the finish', () => {
    for (const id of stufenIds) {
      const l = level(id, p);
      expect(l.ablenkungen).toHaveLength(stufen[id].ablenkungen);
      expect(l.hindernisse.length).toBeGreaterThanOrEqual(stufen[id].hindernisse * 0.7);
      expect(l.hindernisse.filter((h) => h.art === 'bach')).toHaveLength(1);
      expect(l.bachX).toBeLessThan(l.ziel - 500);
      for (const h of l.hindernisse) expect(h.x).toBeGreaterThan(stufen[id].tempo * 3);
    }
  });
  it('never put an obstacle where the button means "recall"', () => {
    for (const id of stufenIds) {
      const l = level(id, p);
      for (const a of l.ablenkungen) {
        for (const h of l.hindernisse) {
          const zone = [a.x - l.vorlauf - l.stufe.tempo * 0.6, a.x + 160];
          expect(h.x + h.breite < zone[0] || h.x > zone[1]).toBe(true);
        }
      }
    }
  });
  it('knows its ids', () => {
    expect(istStufe('welpe')).toBe(true);
    expect(istStufe('x')).toBe(false);
  });
});

describe('play', () => {
  it('can be won with 5 paws on every level', () => {
    for (const id of stufenIds) {
      const l = level(id, p);
      const z = spiele(l);
      expect(z.ende?.art, id).toBe('ziel');
      expect(z.stolperer, id).toBe(0);
      expect(wertung(z, l).pfoten, id).toBe(5);
    }
  });
  it('lets the dog run off when nobody calls', () => {
    const l = level('junghund', p);
    const z = spiele(l, { ruft: false });
    expect(z.ende?.art).toBe('weg');
    expect(z.meter).toBe(l.stufe.geduld);
    expect(wertung(z, l).pfoten).toBe(0);
    expect(wegZeile(z.ende?.wegen)).toMatch(/war spannender/);
  });
  it('turns obstacles into stumbles, never into the end', () => {
    const l = level('welpe', p);
    const z = spiele(l, { springt: false });
    expect(z.ende?.art).toBe('ziel');
    expect(z.stolperer).toBe(l.hindernisse.length);
    const w = wertung(z, l);
    expect(w.pfoten).toBeGreaterThanOrEqual(1);
    expect(w.pfoten).toBeLessThan(5);
    expect(statistik(w)).toMatch(/^3 von 3 Ablenkungen gemeistert, \d+ Stolperer, \d+ Sekunden$/);
    expect(zielZeile(w)).not.toBe('');
  });
  it('buffers a press just before landing', () => {
    const l = level('junghund', p);
    const z = neu(l);
    druecken(z);
    for (let i = 0; i < 20; i++) schritt(z, l);
    expect(z.amBoden).toBe(false);
    while (!z.amBoden) {
      if (z.vy < 0 && z.y - l.boden(z.x) < 12) druecken(z);
      schritt(z, l);
    }
    schritt(z, l);
    expect(z.amBoden).toBe(false);
  });
  it('uses the press as recall while distracted, not as a jump', () => {
    const l = level('junghund', p);
    const z = neu(l);
    while (z.phase !== 'bemerkt') schritt(z, l);
    druecken(z);
    schritt(z, l);
    expect(z.amBoden).toBe(true);
    expect(z.ablenkung[0]).toBe('geschafft');
  });
});
