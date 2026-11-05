/**
 * Builds one site per SITE_ID: injects the routes of src/sites/<id>/pages/** with Astro's
 * file-based routing rules, so a build only contains the pages of that site.
 * See docs/plan/00-multisite.md.
 */
import type { AstroIntegration } from 'astro';
import { existsSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isRouteFile, routePattern } from './routes';

const filesBelow = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? filesBelow(join(dir, e.name)) : [join(dir, e.name)],
  );

export function multisite(siteId: string): AstroIntegration {
  return {
    name: 'luchberg:multisite',
    hooks: {
      'astro:config:setup': ({ config, injectRoute, logger }) => {
        const pagesDir = fileURLToPath(new URL(`./src/sites/${siteId}/pages/`, config.root));
        if (!existsSync(pagesDir)) throw new Error(`Site "${siteId}" has no pages folder (${pagesDir})`);
        const routes = filesBelow(pagesDir)
          .map((file) => ({ file, rel: relative(pagesDir, file) }))
          .filter(({ rel }) => isRouteFile(rel));
        for (const { file, rel } of routes) injectRoute({ pattern: routePattern(rel), entrypoint: file });
        logger.info(`Site "${siteId}": ${routes.length} routes from src/sites/${siteId}/pages`);
      },
    },
  };
}
