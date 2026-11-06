/**
 * Per-site root files (favicons, verification files, …) live in src/sites/<id>/public/ and are
 * served at the site root, next to the shared public/ folder. Pure helpers for the integration.
 */
import { extname, resolve, sep } from 'node:path';

/** Absolute path of the site public file a request path points to, or null if it lies outside the folder. */
export function sitePublicPath(publicDir: string, urlPath: string): string | null {
  let path: string;
  try {
    path = decodeURIComponent(urlPath.split(/[?#]/)[0]);
  } catch {
    return null;
  }
  if (path === '/' || path.endsWith('/')) return null;
  const root = resolve(publicDir);
  const file = resolve(root, '.' + path);
  return file.startsWith(root + sep) ? file : null;
}

const CONTENT_TYPES: Record<string, string> = {
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.xml': 'application/xml',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
};

/** Content type for the dev server (production is served by Cloudflare / the Node adapter). */
export const contentType = (file: string) => CONTENT_TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream';
