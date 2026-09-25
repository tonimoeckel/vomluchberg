import { defineConfig } from 'tinacms';
import { ConfigCollection } from './collections/config';
import { PageCollection } from './collections/page';
import { HundCollection } from './collections/hund';
import { WurfCollection } from './collections/wurf';
import { NewsCollection } from './collections/news';

// Hosting providers expose the current branch under different env names.
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.WORKERS_CI_BRANCH || // Cloudflare Workers Builds
  process.env.CF_PAGES_BRANCH || // Cloudflare Pages
  process.env.HEAD || // Netlify
  'main';

export default defineConfig({
  branch,
  clientId: process.env.PUBLIC_TINA_CLIENT_ID, // von app.tina.io
  token: process.env.TINA_TOKEN, // von app.tina.io

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      // Alle Bilder landen unter public/uploads → im Feld steht "/uploads/…"
      mediaRoot: 'uploads',
      publicFolder: 'public',
    },
  },
  schema: {
    collections: [PageCollection, HundCollection, WurfCollection, NewsCollection, ConfigCollection],
  },
});
