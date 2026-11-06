/** One Tina schema for all sites: ownership, naming and path rules (docs/plan/00-multisite.md, 2.6). */
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Collection } from 'tinacms';
import { collections } from '../../tina/schema';
import { SITE_IDS, sites, type SiteId } from './index';

const ownerOf = (name: string): SiteId[] => SITE_IDS.filter((id) => (sites[id].collections as readonly string[]).includes(name));
const segments = (path: string) => path.split('/');
const isInside = (inner: string, outer: string) =>
  segments(outer).every((part, i) => segments(inner)[i] === part);

const env = { SITE_ID: process.env.SITE_ID, TINA_PUBLIC_SITE_ID: process.env.TINA_PUBLIC_SITE_ID };
afterEach(() => {
  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

describe('Tina schema', () => {
  it('has unique collection names', () => {
    const names = collections.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('has content paths that are unique and never nested in each other', () => {
    for (const a of collections)
      for (const b of collections)
        if (a !== b) expect(isInside(a.path, b.path), `${a.name} (${a.path}) lies in ${b.name} (${b.path})`).toBe(false);
  });

  it('assigns every collection to exactly one site, and every site collection exists', () => {
    for (const c of collections) expect(ownerOf(c.name), c.name).toHaveLength(1);
    const names = collections.map((c) => c.name);
    for (const id of SITE_IDS) for (const name of sites[id].collections as readonly string[]) expect(names, `${id}: ${name}`).toContain(name);
  });

  it('keeps the five luchberg collections where they are (no content move, see §3)', () => {
    const luchberg = Object.fromEntries(
      collections.filter((c) => ownerOf(c.name)[0] === 'luchberg').map((c) => [c.name, c.path]),
    );
    expect(luchberg).toEqual({
      page: 'src/content/seiten',
      hund: 'src/content/hunde',
      wurf: 'src/content/wuerfe',
      news: 'src/content/aktuelles',
      config: 'src/content/config',
    });
  });

  it.each(SITE_IDS.filter((id) => id !== 'luchberg'))('%s: collections are prefixed with the site id and live in src/content/<id>/', (id) => {
    for (const c of collections.filter((c) => ownerOf(c.name)[0] === id)) {
      expect(c.name).toMatch(new RegExp(`^${id}[A-Z]`));
      expect(c.path.startsWith(`src/content/${id}/`), c.path).toBe(true);
    }
  });

  it('prefixes every label with its site, so Karo sees which site she edits', () => {
    for (const c of collections) expect(c.label).toMatch(new RegExp(`^${sites[ownerOf(c.name)[0]].adminLabel} · \\S`));
  });

  it('gives every site exactly one global settings collection', () => {
    for (const id of SITE_IDS) {
      const globals = collections.filter((c) => ownerOf(c.name)[0] === id && c.ui?.global);
      expect(globals, id).toHaveLength(1);
    }
  });

  it('does not depend on SITE_ID (functions aside)', async () => {
    const snapshots = new Set<string>();
    for (const id of SITE_IDS) {
      process.env.SITE_ID = id;
      vi.resetModules();
      const fresh: { collections: Collection[] } = await import('../../tina/schema');
      snapshots.add(JSON.stringify(fresh.collections));
    }
    expect(snapshots.size).toBe(1);
  });

  it('previews a document only in the admin of the site that owns it', () => {
    const document = { _sys: { filename: 'home' } };
    const routed = collections.filter((c) => c.ui?.router);
    expect(routed.length).toBeGreaterThan(0);
    for (const admin of SITE_IDS) {
      delete process.env.TINA_PUBLIC_SITE_ID;
      process.env.SITE_ID = admin;
      for (const c of routed) {
        const path = c.ui!.router!({ document, collection: c } as never);
        if (ownerOf(c.name)[0] === admin) expect(path, `${c.name} in ${admin}`).toMatch(/^\//);
        else expect(path, `${c.name} in ${admin}`).toBeUndefined();
      }
    }
  });
});
