// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tina from '@tinacms/astro/integration';
import { tinaAdminDevRedirect } from '@tinacms/astro/vite';
import tailwindcss from '@tailwindcss/vite';

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

// Alte URLs der bisherigen Website → neue Seiten (für Google & alte Links)
const redirects = {
	'/home': '/',
	'/zuchtstaette': '/zucht',
	'/about-me': '/zucht',
	'/about-me/leistungen': '/zucht',
	'/contacts': '/kontakt',
	'/contacts/index.php': '/kontakt',
	'/gallery': '/galerie',
	'/links': '/',
	'/page/2': '/aktuelles',
	'/page/3': '/aktuelles',
	'/welpen': '/wuerfe',
	'/welpen/wurf': '/wuerfe/a-wurf',
	'/welpen/b-w': '/wuerfe/b-wurf',
	'/rottweilerhuendinnen': '/hunde',
	'/rottweilerrueden': '/hunde',
	'/weitere-rudelmitglieder': '/hunde',
	'/weitere-rudelmitglieder/rauhaardackel': '/hunde/rauhaardackel',
	'/rottweilerhuendinnen/baja-vom-luchberg': '/hunde/baja-vom-luchberg',
	'/rottweilerhuendinnen/donna-von-der-staubzer-hoehe': '/hunde/donna-von-der-staubzer-hoehe',
	'/rottweilerrueden/aaron-vom-luchberg': '/hunde/aaron-vom-luchberg',
	'/rottweilerrueden/hunter-vom-auersberg': '/hunde/hunter-vom-auersberg',
	'/harley-vom-auersberg': '/hunde/harley-vom-auersberg',
	'/aktuelles/sitz-platzund-steh-aber-wie-geht-das': '/aktuelles/sitz-platz-und-steh-teil-2-platz',
};

// https://astro.build/config
export default defineConfig({
	site: getSiteUrl(),
	output: 'static',
	adapter: await getAdapter(),
	redirects,
	integrations: [sitemap(), icon(), tina()],
	build: { inlineStylesheets: 'always' },
	vite: {
		plugins: [tailwindcss(), tinaAdminDevRedirect()],
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
