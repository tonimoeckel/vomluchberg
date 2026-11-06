import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { sites, type SiteDefinition } from './index';

/** A wrangler.jsonc (line comments stripped). */
const wrangler = (path: string) => JSON.parse(readFileSync(path, 'utf8').replace(/^\s*\/\/.*$/gm, ''));
const workerName = (path: string): string => wrangler(path).name;

const configOf = (site: SiteDefinition) => site.wranglerConfig ?? 'wrangler.jsonc';

describe('wrangler config per site', () => {
  it('luchberg deploys with the root wrangler.jsonc as worker "vomluchberg"', () => {
    expect(configOf(sites.luchberg)).toBe('wrangler.jsonc');
    expect(workerName('wrangler.jsonc')).toBe('vomluchberg');
  });

  it('every site has its own worker', () => {
    const names = Object.values(sites).map((s: SiteDefinition) => workerName(configOf(s)));
    expect(new Set(names).size).toBe(names.length);
  });

  it('names the workers as settled in docs/plan/README.md (R1)', () => {
    expect(Object.fromEntries(Object.values(sites).map((s: SiteDefinition) => [s.id, workerName(configOf(s))]))).toEqual({
      luchberg: 'vomluchberg',
      dackel: 'vomluchberg-dackel',
      training: 'vomluchberg-training',
    });
  });

  it.each(Object.values(sites))('$id: runtime settings match the root config and Worker Previews are on', (site) => {
    const { compatibility_date, compatibility_flags, previews, preview_urls } = wrangler(configOf(site));
    const root = wrangler('wrangler.jsonc');
    expect({ compatibility_date, compatibility_flags }).toEqual({
      compatibility_date: root.compatibility_date,
      compatibility_flags: root.compatibility_flags,
    });
    expect(compatibility_flags).toContain('nodejs_compat');
    expect(previews).toEqual({});
    expect(preview_urls).toBe(true);
  });
});
