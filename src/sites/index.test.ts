import { describe, expect, it } from 'vitest';
import { DEFAULT_SITE_ID, SITE_IDS, resolveSiteId, sites } from './index';

describe('resolveSiteId', () => {
  it('defaults to luchberg when unset or empty', () => {
    expect(resolveSiteId(undefined)).toBe('luchberg');
    expect(resolveSiteId(null)).toBe('luchberg');
    expect(resolveSiteId('')).toBe('luchberg');
    expect(resolveSiteId('  ')).toBe(DEFAULT_SITE_ID);
  });

  it('accepts every known site, ignoring surrounding whitespace', () => {
    for (const id of SITE_IDS) expect(resolveSiteId(` ${id} `)).toBe(id);
  });

  it('rejects unknown ids', () => {
    expect(() => resolveSiteId('rottweiler')).toThrow(/Unknown SITE_ID "rottweiler"/);
  });
});

describe('site definitions', () => {
  it('are keyed by their own id', () => {
    for (const [key, site] of Object.entries(sites)) expect(site.id).toBe(key);
  });

  it.each(Object.values(sites))('$id: redirects are absolute paths and never chain', (site) => {
    const redirects: Record<string, string> = site.redirects;
    for (const [from, to] of Object.entries(redirects)) {
      expect(from).toMatch(/^\//);
      expect(to).toMatch(/^\//);
      expect(redirects[to], `${from} → ${to} chains`).toBeUndefined();
    }
  });

  it('keeps all 23 old-site redirects of vomluchberg.de', () => {
    expect(Object.keys(sites.luchberg.redirects)).toHaveLength(23);
    expect(sites.luchberg.redirects['/welpen/b-w']).toBe('/wuerfe/b-wurf');
  });
});
