# Rottweiler vom Luchberg – vomluchberg.de

Website for Karo's ADRK Rottweiler kennel "vom Luchberg" (Glashütte OT Luchau).

**Stack:** Astro 6 · Tailwind CSS 4 · TinaCMS / TinaCloud (visual editing via `@tinacms/astro`, no React on the site) · Cloudflare Workers (static assets, free tier)

Based on the official [`tina-astro-starter`](https://github.com/tinacms/tina-astro-starter), rebuilt with our own content model and design.

---

## Quick start

```sh
npm install
cp .env.example .env        # Tina credentials are not needed for local work
npm run dev                  # site: http://localhost:4321  ·  CMS: http://localhost:4321/admin
```

`npm run dev` starts Tina in **local mode**: edits in `/admin` are written straight into `src/content/**`.

| Script | What it does |
| --- | --- |
| `npm run dev` | Tina (local) + Astro dev server |
| `npm run build` | Production build against TinaCloud (needs `PUBLIC_TINA_CLIENT_ID` + `TINA_TOKEN`) |
| `npm run build:local` | Offline build without TinaCloud (CI checks, previews) |
| `npx astro check` | Type check |

## Content model (what Karo can edit)

| Tina collection | Files | Route | Notes |
| --- | --- | --- | --- |
| **Seiten** | `src/content/seiten/*.md` | `/`, `/zucht`, `/hunde`, … | Pages are built from blocks (see below) |
| **Unsere Hunde** | `src/content/hunde/*.md` | `/hunde/[slug]` | Category: Unsere Rottweiler · Aufzucht · Weitere Rudelmitglieder · In Erinnerung |
| **Würfe** | `src/content/wuerfe/*.md` | `/wuerfe/[slug]` | Status: geplant / aktuell / vergangen, puppies list, gallery |
| **Aktuelles** | `src/content/aktuelles/*.md` | `/aktuelles/[slug]` | News / blog posts |
| **Einstellungen** | `src/content/config/config.json` | global | Name, logo, **colour scheme**, contact data, social links, menu |

**Page blocks** (`tina/blocks/index.ts` ↔ `src/components/blocks/*`): Hero · Text (with image) · Highlights · Galerie · Hunde‑Übersicht (auto) · Würfe‑Übersicht (auto) · Aktuelles (auto) · CTA · Kontakt + Formular.

Adding a block = add a template in `tina/blocks/index.ts`, a component in `src/components/blocks/`, and a case in `Blocks.astro`.

Images live in `public/uploads/**` (Tina media root `uploads`). Imported images were resized to max. 1600 px.

### Visual editing

Every editable region is a `<TinaIsland>` registered in `src/lib/islands.ts`; the on-demand route `/tina-island/[name]` re-renders it while Karo types. Mark editable elements with `data-tina-field={tinaField(obj, 'field')}`.

## Design

Light and friendly, with orange → pink accents and neon details (Karo's brief). Three colour schemes are defined as CSS variables in `src/styles/global.css`:

- `sonnenuntergang`: warm cream, orange → red → pink
- `neon` (default): white, hot orange/pink with glow details
- `pfirsich`: softer peach/coral, rounder corners

The active scheme is set in **Tina → Einstellungen → Farbschema**.

Fonts are self-hosted via Fontsource (Bricolage Grotesque + Inter), so no Google Fonts requests are made (GDPR). There is no tracking and there are no cookies.

## Deployment (Cloudflare, free)

The site builds to static HTML; only `/tina-island` runs on demand. `astro.config.mjs` picks the Cloudflare adapter automatically in Cloudflare CI (`WORKERS_CI` / `CF_PAGES`).

1. Push the repo to GitHub.
2. **TinaCloud:** create a project at [app.tina.io](https://app.tina.io), connect the GitHub repo and invite Karo as an editor. The free tier has only a few user seats, so check [tina.io/pricing](https://tina.io/pricing). Copy the Client ID and a read-only token.
3. **Cloudflare:** go to *Workers & Pages → Create → Import a repository*.
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
   - Environment variables (build): `PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN`, `SITE_URL=https://www.vomluchberg.de`, optionally `PUBLIC_WEB3FORMS_KEY`
4. Every push to `main` (including Karo's saves from TinaCloud) triggers a new build, and the change is live about 1–2 minutes later.
5. Custom domain: see [`docs/domain-umzug.md`](docs/domain-umzug.md).

**Contact form:** create a free access key at [web3forms.com](https://web3forms.com) with Karo's e-mail address, then set `PUBLIC_WEB3FORMS_KEY`. Without a key, the form opens the visitor's mail app. Mention the form provider in the privacy policy.

## Migration from the old site

The old site was a Plesk *Web Presence Builder* site (`old_archive/vomluchberg_archive/httpdocs`; `/fb` is only a Facebook-template copy). `caninepure.de` and `vitale-hunde.de` in the same archive are separate sites and were **not** migrated.

- `migration/old-site-content.json`: all texts extracted from the old pages
- `migration/image-map.json`: old image path → new `/uploads/…` path
- `migration/migrate.py`: generated the initial `src/content/**` (one-off; don't re-run after Karo starts editing, because it overwrites content)
- Old URLs are 301-redirected to the new pages (`redirects` in `astro.config.mjs`)

## Before going live (open items)

- [ ] Karo reviews all texts (the "Über mich" and "Zuchtstätte" texts were taken over 1:1 from the old site)
- [ ] Impressum + Datenschutzerklärung (placeholders; use a generator and have Karo confirm)
- [ ] Final logo as SVG (currently derived from the old line-art emblem)
- [ ] Choose the colour scheme with Karo
- [ ] New dog from December 2025 ("Willkommen im Rudel"): name and photos
- [ ] C-Wurf: parents and planned date, once known
- [ ] Web3Forms key, TinaCloud project, Cloudflare project
- [ ] Domain transfer (`docs/domain-umzug.md`)
