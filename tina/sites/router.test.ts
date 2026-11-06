import { afterEach, describe, expect, it } from 'vitest';
import { adminSiteId, exposeSiteId, seitenPfad, siteRouter } from './router';

const env = { SITE_ID: process.env.SITE_ID, TINA_PUBLIC_SITE_ID: process.env.TINA_PUBLIC_SITE_ID };
afterEach(() => {
  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});
const setEnv = (siteId?: string, publicId?: string) => {
  if (siteId === undefined) delete process.env.SITE_ID;
  else process.env.SITE_ID = siteId;
  if (publicId === undefined) delete process.env.TINA_PUBLIC_SITE_ID;
  else process.env.TINA_PUBLIC_SITE_ID = publicId;
};

describe('adminSiteId', () => {
  it('defaults to luchberg', () => {
    setEnv();
    expect(adminSiteId()).toBe('luchberg');
  });

  it('reads SITE_ID in Node and TINA_PUBLIC_SITE_ID (the admin bundle) first', () => {
    setEnv('luchberg');
    expect(adminSiteId()).toBe('luchberg');
    setEnv('pudel', 'luchberg');
    expect(adminSiteId()).toBe('luchberg');
  });

  it('fails on unknown ids', () => {
    setEnv('pudel');
    expect(() => adminSiteId()).toThrow(/Unknown SITE_ID/);
  });
});

describe('exposeSiteId', () => {
  it('copies the resolved SITE_ID to TINA_PUBLIC_SITE_ID (the only variables the admin bundle sees)', () => {
    setEnv(' luchberg ');
    exposeSiteId();
    expect(process.env.TINA_PUBLIC_SITE_ID).toBe('luchberg');
    setEnv('', 'pudel');
    exposeSiteId();
    expect(process.env.TINA_PUBLIC_SITE_ID).toBe('luchberg');
  });
});

describe('siteRouter', () => {
  const router = siteRouter('luchberg', (d) => `/x/${d._sys.filename}`);
  const document = { _sys: { filename: 'baja' } };

  it('routes in the admin of the owning site', () => {
    setEnv('luchberg');
    expect(router({ document })).toBe('/x/baja');
  });
});

describe('seitenPfad', () => {
  it('serves home at / and other pages at /<filename>', () => {
    expect(seitenPfad({ _sys: { filename: 'home' } })).toBe('/');
    expect(seitenPfad({ _sys: { filename: 'zucht' } })).toBe('/zucht');
  });
});
