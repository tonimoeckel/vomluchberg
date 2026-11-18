import { describe, expect, it } from 'vitest';
import { profil } from './profil';
import { ABSCHNITT, schwierigkeit, welt } from './strecke';
import { ABSTAND, HALB, SCHRITT, SCHWERKRAFT, SPRUNG, VORLAUF, ansprechen, neu, schritt, springen, tempo, wertung, type Zustand } from './physik';
import { hundename, statistik, wegZeile } from './texte';

const p = profil();
const w = welt(p);

/**
 * Plays until the run ends or `maxSekunden` pass. `reaktion`: how long the player needs to speak to
 * the dog after it noticed a distraction (Infinity = never). Obstacles are jumped perfectly.
 */
function spiele({ reaktion = 0.15, springt = true, maxSekunden = 200, seed = 1 } = {}): Zustand {
  const z = neu(w, seed);
  const flug = (2 * SPRUNG) / SCHWERKRAFT;
  while (!z.ende && z.zeit < maxSekunden) {
    if (z.aktiv && z.aktiv.status === 'bemerkt' && z.zeit - z.aktiv.bemerktUm >= reaktion) ansprechen(z);
    if (springt && z.hund.amBoden) {
      const o = z.hindernisse.find((h) => !h.getroffen && !h.geschafft && h.x + h.breite > z.x - HALB);
      if (o && o.x + o.breite / 2 - z.x <= (tempo(z) * flug) / 2 - 6) springen(z);
    }
    schritt(z, w);
  }
  return z;
}

describe('track', () => {
  it('is continuous when walking back and forth along the map', () => {
    for (const x of [ABSCHNITT, 2 * ABSCHNITT, 3 * ABSCHNITT]) expect(Math.abs(w.boden(x - 1) - w.boden(x + 1))).toBeLessThan(0.5);
  });
  it('crosses the Müglitz once per pass, east of the summit', () => {
    expect(w.bach(0)).toBeCloseTo(p.bach * ABSCHNITT);
    expect(w.bach(1)).toBeGreaterThan(ABSCHNITT);
    expect(w.bach(1)).toBeLessThan(2 * ABSCHNITT);
  });
  it('gets faster and less forgiving until the window is shorter than a reaction', () => {
    const a = schwierigkeit(0), b = schwierigkeit(60), c = schwierigkeit(150);
    expect(b.tempo).toBeGreaterThan(a.tempo);
    expect(b.fenster).toBeLessThan(a.fenster);
    expect(c.fenster).toBeLessThanOrEqual(0.25);
    expect(c.ablenkungAbstand).toBeLessThan(a.ablenkungAbstand);
  });
});

describe('play', () => {
  it('is deterministic for a seed', () => {
    expect(wertung(spiele({ seed: 3, maxSekunden: 60 }))).toEqual(wertung(spiele({ seed: 3, maxSekunden: 60 })));
  });
  it('ends at the first distraction when nobody speaks to the dog', () => {
    const z = spiele({ reaktion: Infinity });
    expect(z.ende).not.toBeNull();
    expect(z.gemeistert).toBe(0);
    expect(wegZeile('Bruno', z.ende?.wegen)).toMatch(/^Weg ist Bruno: .+ war spannender\.$/);
  });
  it('can be played for a long time with quick reactions, scoring as it goes', () => {
    const z = spiele({ reaktion: 0.12, maxSekunden: 90 });
    expect(z.ende).toBeNull();
    expect(z.gemeistert).toBeGreaterThan(15);
    expect(z.stolperer).toBe(0);
    expect(wertung(z).punkte).toBeGreaterThan(wertung(z).meter);
  });
  it('becomes impossible for a human reaction time', () => {
    for (const seed of [1, 2, 3]) {
      const z = spiele({ reaktion: 0.32, seed });
      expect(z.ende, `seed ${seed}`).not.toBeNull();
      expect(z.ende!.zeit).toBeGreaterThan(40);
      expect(z.ende!.zeit).toBeLessThan(200);
    }
  });
  it('turns obstacles into stumbles that cost points, never into the end', () => {
    const z = spiele({ springt: false, maxSekunden: 30 });
    expect(z.ende).toBeNull();
    expect(z.stolperer).toBeGreaterThan(3);
    expect(statistik(wertung(z))).toMatch(/^\d+ Ablenkungen? gemeistert, \d+ Meter in \d+ Sekunden$/);
  });
  it('keeps obstacles out of the distraction zones in the first 40 seconds', () => {
    const z = neu(w, 5);
    while (z.zeit < 30 && !z.ende) { if (z.aktiv) ansprechen(z); schritt(z, w, SCHRITT); }
    expect(z.ende).toBeNull();
    const d = schwierigkeit(0);
    for (const a of z.ablenkungen) for (const o of z.hindernisse) {
      if (o.art === 'bach' || o.x > z.x + 1000) continue;
      expect(o.x + o.breite <= a.x - VORLAUF - d.tempo * 0.6 || o.x >= a.x + 160).toBe(true);
    }
  });
  it('lets you jump where your dog jumped', () => {
    const z = neu(w);
    springen(z);
    schritt(z, w);
    const absprung = z.x;
    expect(z.hund.amBoden).toBe(false);
    while (z.x - ABSTAND < absprung - 1) { expect(z.mensch.amBoden).toBe(true); schritt(z, w); }
    for (let i = 0; i < 3; i++) schritt(z, w);
    expect(z.mensch.amBoden).toBe(false);
  });
  it('rewards a quick Ansprache more and costs nothing without a distraction', () => {
    const z = neu(w);
    expect(ansprechen(z)).toBe('ja');
    expect(z.punkte).toBe(0);
    while (!z.aktiv) schritt(z, w);
    expect(ansprechen(z)).toBe('fein');
    expect(z.punkte).toBeGreaterThan(140);
  });
});

describe('dog name', () => {
  it('is trimmed, short and never empty', () => {
    expect(hundename('  Hanni ')).toBe('Hanni');
    expect(hundename('')).toBe('Bruno');
    expect(hundename('x'.repeat(40))).toHaveLength(20);
  });
});
