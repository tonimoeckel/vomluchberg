import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { sites, type SiteDefinition } from './index';

/** Worker name from a wrangler.jsonc (line comments stripped). */
const workerName = (path: string): string =>
  JSON.parse(readFileSync(path, 'utf8').replace(/^\s*\/\/.*$/gm, '')).name;

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
});
