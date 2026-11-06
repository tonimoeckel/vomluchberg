import { describe, expect, it } from 'vitest';
import { isNoindex, robotsTxt } from './robots';

describe('isNoindex', () => {
  it.each(['true', 'TRUE', ' 1 ', 'yes'])('%j → true', (raw) => expect(isNoindex(raw)).toBe(true));
  it.each([undefined, null, '', 'false', '0', 'no'])('%j → false', (raw) => expect(isNoindex(raw)).toBe(false));
});

describe('robotsTxt', () => {
  it('allows everything and points to the sitemap', () => {
    expect(robotsTxt({ site: new URL('https://www.vomluchberg.de'), noindex: false })).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://www.vomluchberg.de/sitemap-index.xml\n',
    );
  });

  it('omits the sitemap without a site URL', () => {
    expect(robotsTxt({ site: undefined, noindex: false })).toBe('User-agent: *\nAllow: /\n');
  });

  it('disallows everything for previews', () => {
    expect(robotsTxt({ site: new URL('https://x.workers.dev'), noindex: true })).toBe('User-agent: *\nDisallow: /\n');
  });
});
