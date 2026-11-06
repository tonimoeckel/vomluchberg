import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { contentType, sitePublicPath } from './public-files';

const dir = resolve('/repo/src/sites/luchberg/public');

describe('sitePublicPath', () => {
  it('maps request paths into the site public folder', () => {
    expect(sitePublicPath(dir, '/favicon.ico')).toBe(resolve(dir, 'favicon.ico'));
    expect(sitePublicPath(dir, '/icons/a%20b.png?v=2')).toBe(resolve(dir, 'icons/a b.png'));
  });

  it('ignores directories and the root', () => {
    expect(sitePublicPath(dir, '/')).toBeNull();
    expect(sitePublicPath(dir, '/hunde/')).toBeNull();
  });

  it('never leaves the folder', () => {
    expect(sitePublicPath(dir, '/../site.ts')).toBeNull();
    expect(sitePublicPath(dir, '/%2e%2e/site.ts')).toBeNull();
    expect(sitePublicPath(dir, '/%E0%A4%A')).toBeNull();
  });
});

describe('contentType', () => {
  it('knows favicon and text types', () => {
    expect(contentType('favicon.ico')).toBe('image/x-icon');
    expect(contentType('ICON-192.PNG')).toBe('image/png');
    expect(contentType('robots.txt')).toMatch(/^text\/plain/);
    expect(contentType('blob.bin')).toBe('application/octet-stream');
  });
});
