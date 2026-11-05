// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tina from '@tinacms/astro/integration';
import { tinaAdminDevRedirect } from '@tinacms/astro/vite';
import tailwindcss from '@tailwindcss/vite';
import { multisite } from './src/multisite/integration.ts';
import { resolveSiteId, sites } from './src/sites/index.ts';

// Which website this build produces (see docs/plan/00-multisite.md). Defaults to luchberg.
const SITE_ID = resolveSiteId(process.env.SITE_ID);
const site = sites[SITE_ID];

// Alle Inhaltsseiten werden statisch gebaut. Nur /tina-island (Live-Vorschau im
// Tina-Editor) läuft on-demand. Auf Cloudflare Pages wird automatisch der
// Cloudflare-Adapter genutzt, lokal der Node-Adapter.
async function getAdapter() {
	const cloudflare = async () => (await import('@astrojs/cloudflare')).default();
	const node = async () => (await import('@astrojs/node')).default({ mode: 'standalone' });
	if (process.env.DEPLOY_ADAPTER === 'cloudflare' || process.env.CF_PAGES || process.env.WORKERS_CI) return cloudflare();
	return node();
}

function getSiteUrl() {
	if (process.env.SITE_URL) return process.env.SITE_URL;
	if (process.env.CF_PAGES_URL) return process.env.CF_PAGES_URL;
	return 'http://localhost:4321';
}

// Keeps syntax-highlighting grammars out of the on-demand server bundle (the
// Cloudflare worker). The only on-demand route, /tina-island, uses
// `astro/container`, which pulls in Astro's config schema and with it
// `@astrojs/markdown-remark` (Shiki) and the adapter's Prism loader. Their
// ~240 languages, ~65 themes, the Oniguruma WASM and ~290 Prism components are
// lazy `import()`s that are never called there (islands render Tina rich text,
// not Markdown code blocks) but would still be uploaded, pushing the worker
// towards the 3 MiB free-plan limit. All of them resolve to one empty module
// in the `ssr` build only; prerendered pages and dev keep full highlighting.
/** @returns {import('vite').Plugin} */
function stubServerHighlighters() {
	const STUB_ID = '\0luchberg:no-highlighter';
	const STUBBED = [/^@shikijs\/(langs|themes)\//, /^shiki\/wasm$/, /^prismjs\/components\/prism-[^/]+\.js$/];
	return {
		name: 'luchberg:stub-server-highlighters',
		apply: 'build',
		enforce: 'pre',
		applyToEnvironment: (environment) => environment.name === 'ssr',
		resolveId(id) {
			if (id === STUB_ID || STUBBED.some((re) => re.test(id))) return STUB_ID;
		},
		load(id) {
			if (id === STUB_ID) return 'export default [];';
		},
	};
}


// https://astro.build/config
export default defineConfig({
	site: getSiteUrl(),
	output: 'static',
	adapter: await getAdapter(),
	redirects: site.redirects,
	integrations: [multisite(SITE_ID), sitemap(), icon(), tina()],
	build: { inlineStylesheets: 'always' },
	vite: {
		plugins: [tailwindcss(), tinaAdminDevRedirect(), stubServerHighlighters()],
		ssr: { noExternal: ['@tinacms/astro', '@tinacms/bridge'] },
		build: {
			rollupOptions: {
				onwarn(warning, warn) {
					if (warning.code === 'UNUSED_EXTERNAL_IMPORT' && warning.exporter === 'tinacms/dist/client') return;
					warn(warning);
				},
			},
		},
	},
});
