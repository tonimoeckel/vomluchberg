import { describe, expect, it } from 'vitest';
import { SITE_IDS, sites } from '../sites/index';
import { querverweisZiele } from './querverweis';

describe('querverweisZiele', () => {
  const registry = {
    a: { name: 'A', url: 'https://a.de', live: true, querverweise: ['b', 'c'] },
    b: { name: 'B', url: 'https://b.de', live: true, querverweise: ['a'] },
    c: { name: 'C', url: 'https://c.example', live: false },
    d: { name: 'D', live: true, querverweise: ['x', 'a'] },
  };

  it('lists only live targets with a URL', () => {
    expect(querverweisZiele('a' as never, registry)).toEqual([{ id: 'b', name: 'B', url: 'https://b.de' }]);
  });

  it('ignores unknown ids and sites without targets', () => {
    expect(querverweisZiele('d' as never, registry)).toEqual([{ id: 'a', name: 'A', url: 'https://a.de' }]);
    expect(querverweisZiele('c' as never, registry)).toEqual([]);
  });

  it('points only to known sites in the real registry', () => {
    for (const id of SITE_IDS) for (const ziel of (sites[id] as { querverweise?: readonly string[] }).querverweise ?? []) expect(SITE_IDS).toContain(ziel);
  });

  it('links a live site with an https URL only', () => {
    for (const id of SITE_IDS) {
      const s = sites[id] as { live?: boolean; url?: string };
      if (s.live) expect(s.url, id).toMatch(/^https:\/\//);
    }
  });
});
