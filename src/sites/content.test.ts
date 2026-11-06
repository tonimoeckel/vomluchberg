/**
 * Image references in the content of every site (docs/plan/00-multisite.md, 2.4).
 * Every worker ships all of public/uploads, so a site using another site's folder still works –
 * that is only reported as a warning for Toni. A reference to a missing file fails.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { collections } from '../../tina/schema';
import { SITE_IDS, sites, type SiteId } from './index';

const filesBelow = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? filesBelow(join(dir, e.name)) : [join(dir, e.name)],
      )
    : [];

/** `/uploads/…` paths in a Markdown/JSON file (frontmatter, body and JSON values). */
const uploadRefs = (text: string): string[] =>
  [...text.matchAll(/\/uploads\/[^\s"'()<>\]]+/g)].map((m) => decodeURI(m[0]));

const contentOf = (id: SiteId) =>
  collections
    .filter((c) => (sites[id].collections as readonly string[]).includes(c.name))
    .flatMap((c) => filesBelow(c.path))
    .map((file) => ({ file, refs: uploadRefs(readFileSync(file, 'utf8')) }));

describe('uploadRefs', () => {
  it('finds image paths in frontmatter, JSON and Markdown', () => {
    expect(uploadRefs('bild: /uploads/dackel/a.jpg\n"logo": "/uploads/x/b%20c.png", ![x](/uploads/y.jpg)')).toEqual([
      '/uploads/dackel/a.jpg',
      '/uploads/x/b c.png',
      '/uploads/y.jpg',
    ]);
  });
});

describe.each(SITE_IDS)('content of %s', (id) => {
  const content = contentOf(id);

  it('references only images that exist in public/', () => {
    const missing = content.flatMap(({ file, refs }) =>
      refs.filter((ref) => !existsSync(join('public', ref))).map((ref) => `${file}: ${ref}`),
    );
    expect(missing).toEqual([]);
  });

  it.skipIf(id === 'luchberg')('keeps its images in public/uploads/<id>/ (warning only)', () => {
    const foreign = content.flatMap(({ file, refs }) =>
      refs.filter((ref) => !ref.startsWith(`/uploads/${id}/`)).map((ref) => `${file}: ${ref}`),
    );
    if (foreign.length) console.warn(`[${id}] images outside /uploads/${id}/ (they work, but belong elsewhere):\n  ${foreign.join('\n  ')}`);
  });
});
