import { describe, expect, it } from 'vitest';
import { isRouteFile, routePattern } from './routes';

describe('routePattern', () => {
  it.each([
    ['index.astro', '/'],
    ['[slug].astro', '/[slug]'],
    ['404.astro', '/404'],
    ['hunde/[slug].astro', '/hunde/[slug]'],
    ['hunde/index.astro', '/hunde'],
    ['tina-island/[name].ts', '/tina-island/[name]'],
    ['robots.txt.ts', '/robots.txt'],
    ['[...rest].astro', '/[...rest]'],
    ['index/foo.astro', '/index/foo'],
    ['wuerfe\\[slug].astro', '/wuerfe/[slug]'],
  ])('%s → %s', (file, pattern) => {
    expect(routePattern(file)).toBe(pattern);
  });
});

describe('isRouteFile', () => {
  it('accepts pages and endpoints', () => {
    expect(isRouteFile('index.astro')).toBe(true);
    expect(isRouteFile('tina-island/[name].ts')).toBe(true);
  });

  it('skips underscore files and folders, styles and type declarations', () => {
    expect(isRouteFile('_partial.astro')).toBe(false);
    expect(isRouteFile('_lib/helper.ts')).toBe(false);
    expect(isRouteFile('styles.css')).toBe(false);
    expect(isRouteFile('env.d.ts')).toBe(false);
  });
});
