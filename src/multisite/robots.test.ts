import { describe, expect, it } from 'vitest';
import { isNoindex, noindexFromEnv, robotsTxt } from './robots';

describe('isNoindex', () => {
  it.each(['true', 'TRUE', ' 1 ', 'yes'])('%j → true', (raw) => expect(isNoindex(raw)).toBe(true));
  it.each([undefined, null, '', 'false', '0', 'no'])('%j → false', (raw) => expect(isNoindex(raw)).toBe(false));
});

describe('noindexFromEnv', () => {
  const noindex = (env: Parameters<typeof noindexFromEnv>[0]) => noindexFromEnv(env).noindex;

  it('indexes local builds and production builds of main', () => {
    expect(noindex({})).toBe(false);
    expect(noindex({ WORKERS_CI_BRANCH: 'main' })).toBe(false);
  });

  it('keeps preview builds of other branches out of search engines', () => {
    expect(noindexFromEnv({ WORKERS_CI_BRANCH: 'claude/impl-00-multisite-pr-b' })).toEqual({
      noindex: true,
      reason: 'preview build of branch "claude/impl-00-multisite-pr-b"',
    });
  });

  it('follows SITE_NOINDEX when it is set', () => {
    expect(noindex({ SITE_NOINDEX: 'true' })).toBe(true);
    expect(noindex({ SITE_NOINDEX: 'true', WORKERS_CI_BRANCH: 'main' })).toBe(true);
    expect(noindex({ SITE_NOINDEX: 'false', WORKERS_CI_BRANCH: 'feature' })).toBe(false);
  });

  it('ignores an empty SITE_NOINDEX', () => {
    expect(noindex({ SITE_NOINDEX: '', WORKERS_CI_BRANCH: 'feature' })).toBe(true);
    expect(noindex({ SITE_NOINDEX: ' ', WORKERS_CI_BRANCH: '' })).toBe(false);
  });
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
