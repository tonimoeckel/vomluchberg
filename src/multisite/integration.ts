/**
 * Builds one site per SITE_ID: injects the routes of src/sites/<id>/pages/** with Astro's
 * file-based routing rules, so a build only contains the pages of that site, and serves the
 * site's root files from src/sites/<id>/public/ (copied into the build output, served in dev).
 * See docs/plan/00-multisite.md.
 */
import type { AstroIntegration } from 'astro';
import type { Plugin } from 'vite';
import { cpSync, createReadStream, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contentType, sitePublicPath } from './public-files';
import { isNoindex } from './robots';
import { isRouteFile, routePattern } from './routes';

const filesBelow = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? filesBelow(join(dir, e.name)) : [join(dir, e.name)],
  );

/** Dev server: answers requests for files in the site's public folder (before Astro's routes). */
function servePublicDir(publicDir: string): Plugin {
  return {
    name: 'luchberg:multisite-public',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const file = req.url && sitePublicPath(publicDir, req.url);
        if (!file || !existsSync(file) || !statSync(file).isFile()) return next();
        res.setHeader('Content-Type', contentType(file));
        createReadStream(file).pipe(res);
      });
    },
  };
}

/** `virtual:multisite`: the build's site id and noindex flag (types in virtual.d.ts). */
function virtualModule(values: { siteId: string; noindex: boolean }): Plugin {
  const id = 'virtual:multisite';
  const resolved = '\0' + id;
  return {
    name: 'luchberg:multisite-virtual',
    resolveId: (source) => (source === id ? resolved : undefined),
    load: (source) =>
      source === resolved
        ? Object.entries(values).map(([k, v]) => `export const ${k} = ${JSON.stringify(v)};`).join('\n')
        : undefined,
  };
}

export function multisite(siteId: string): AstroIntegration {
  let publicDir = '';
  return {
    name: 'luchberg:multisite',
    hooks: {
      'astro:config:setup': ({ config, injectRoute, updateConfig, logger }) => {
        publicDir = fileURLToPath(new URL(`./src/sites/${siteId}/public/`, config.root));
        const noindex = isNoindex(process.env.SITE_NOINDEX);
        const plugins = [virtualModule({ siteId, noindex })];
        if (existsSync(publicDir)) plugins.push(servePublicDir(publicDir));
        updateConfig({ vite: { plugins } });
        if (noindex) logger.warn(`SITE_NOINDEX is set: "${siteId}" is built with robots noindex`);

        const pagesDir = fileURLToPath(new URL(`./src/sites/${siteId}/pages/`, config.root));
        if (!existsSync(pagesDir)) throw new Error(`Site "${siteId}" has no pages folder (${pagesDir})`);
        const routes = filesBelow(pagesDir)
          .map((file) => ({ file, rel: relative(pagesDir, file) }))
          .filter(({ rel }) => isRouteFile(rel));
        for (const { file, rel } of routes) injectRoute({ pattern: routePattern(rel), entrypoint: file });
        if (!routes.some(({ rel }) => routePattern(rel) === '/robots.txt')) {
          injectRoute({ pattern: '/robots.txt', entrypoint: fileURLToPath(new URL('./src/multisite/robots.txt.ts', config.root)) });
        }
        logger.info(`Site "${siteId}": ${routes.length} routes from src/sites/${siteId}/pages`);
      },
      'astro:build:done': ({ dir, logger }) => {
        if (!existsSync(publicDir)) return;
        // Site files win over files of the same name in the shared public/ folder.
        cpSync(publicDir, fileURLToPath(dir), { recursive: true });
        logger.info(`Copied src/sites/${siteId}/public into the build output`);
      },
    },
  };
}
