import { describe, expect, it } from 'vitest';
import { abgehauen, faehrte, faehrteArt, maeander } from './faehrte';
import { PFOTE, PFOTE_MASKE, sitzen } from './pfotenspur';

describe('margin trail pages', () => {
  it('walks on the offers, the detail pages, "Über mich" and the inquiry', () => {
    for (const p of ['/angebote', '/angebote/', '/angebote/einzeltraining', '/angebote/basistraining', '/ueber-mich', '/anfrage/']) expect(faehrteArt(p)).toBe('hund');
    expect(faehrteArt('/angebote/welpenkurs')).toBe('welpe');
  });

  it('stays off the start page (its own motion budget), the legal pages and the 404', () => {
    for (const p of ['/', '/impressum', '/datenschutz', '/404', '/anfragen', '/angebotene']) expect(faehrteArt(p)).toBeNull();
  });
});

describe('margin trail', () => {
  it('meanders straight down within its amplitude', () => {
    const m = maeander(1000, 9, 500, 40);
    expect(m[0].y).toBe(40);
    for (let i = 1; i < m.length; i++) expect(m[i].y).toBeGreaterThan(m[i - 1].y);
    for (const p of m) expect(Math.abs(p.x)).toBeLessThanOrEqual(9);
  });

  it('is deterministic, capped and stays in the middle of the margin', () => {
    expect(faehrte('hund')).toEqual(faehrte('hund'));
    for (const art of ['hund', 'welpe'] as const) {
      const f = faehrte(art);
      expect(f.weg.length).toBeLessThanOrEqual(90);
      expect(f.weg.length).toBeGreaterThan(60);
      // ±(amplitude + offset): 64px desktop margins hold a 18px print at x ± 24.
      for (const p of [...f.weg, ...f.ende]) expect(Math.abs(p.x)).toBeLessThanOrEqual(24);
      // Downwards: every print is turned roughly to the south (90°).
      for (const p of f.weg) expect(Math.abs(p.winkel - 90)).toBeLessThan(45);
      for (const p of f.ende) {
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThanOrEqual(f.endeHoehe);
      }
    }
  });

  it('walks a puppy in shorter steps than a dog', () => {
    const schritt = (art: 'hund' | 'welpe') => {
      const w = faehrte(art).weg;
      return (w.at(-1)!.y - w[0].y) / (w.length - 1);
    };
    expect(schritt('welpe')).toBeLessThan(schritt('hund') * 0.8);
  });

  it('ends with a sitting dog, the run-up clear of its paws', () => {
    const { ende } = faehrte('hund');
    const sitz = ende.slice(-4), anlauf = ende.slice(0, -4);
    expect(anlauf.length).toBeGreaterThan(0);
    const oben = Math.min(...sitz.map((p) => p.y));
    for (const p of anlauf) expect(p.y).toBeLessThan(oben - 6);
  });
});

describe('sitting dog', () => {
  it('puts the front paws side by side and the hind paws behind and wider', () => {
    const [hl, hr, vl, vr] = sitzen({ x: 0, y: 100 }, 90, 12);
    // Facing south (y down): the front paws are level, the hind paws further north.
    expect(vl.y).toBe(vr.y);
    expect(hl.y).toBeLessThan(vl.y);
    expect(Math.abs(hl.x - hr.x)).toBeGreaterThan(Math.abs(vl.x - vr.x));
    expect(Math.abs(vl.x - vr.x)).toBeCloseTo(12, 0);
  });
});

describe('404 trail', () => {
  it('runs from the lower left across the box and out over its right edge', () => {
    const spur = abgehauen(1400, 260);
    expect(spur[0].x).toBeLessThan(100);
    expect(spur[0].y).toBeGreaterThan(180);
    expect(spur.at(-1)!.x).toBeGreaterThan(1400);
    for (const p of spur) expect(p.y).toBeGreaterThan(0);
    for (let i = 1; i < spur.length; i++) expect(spur[i].zeit).toBeGreaterThan(spur[i - 1].zeit);
    // A quick gallop: the whole run is laid in a few seconds.
    expect(spur.at(-1)!.zeit).toBeLessThan(7);
  });
});

describe('paw shape', () => {
  it('is one path, also as a CSS mask image', () => {
    expect(PFOTE.startsWith('M')).toBe(true);
    expect(PFOTE_MASKE).toMatch(/^url\("data:image\/svg\+xml,%3Csvg/);
    expect(PFOTE_MASKE.slice(5, -2)).not.toMatch(/[<>"#]/);
  });
});
