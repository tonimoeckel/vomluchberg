# CLAUDE.md – vomluchberg.de

Website for **Karo (Karolin Riesing)**, owner of the ADRK Rottweiler kennel "vom Luchberg" in Glashütte OT Luchau (Saxony). Toni is the technical implementer; Karo is non-technical and edits simple content herself via TinaCMS. Layout/design/structural changes are Toni's job.

- Talk to Toni in **German**. Code, comments, commits and docs are in English, except `docs/domain-umzug.md` and `docs/plan/fragen-an-karo.md`, which Karo also reads.
- **All site content is German**, written in an informal "ihr/euch" tone.

## Stack

- Astro 6 (`output: 'static'`) + Tailwind CSS 4 + `@tailwindcss/typography`
- TinaCMS 3 / TinaCloud with `@tinacms/astro`. Visual editing works through Tina islands, with **no React on the site** (React is only a devDependency for the admin UI).
- Hosting: Cloudflare Workers (static assets). The adapter is chosen in `astro.config.mjs`: Cloudflare in CI (`WORKERS_CI`/`CF_PAGES`) or with `DEPLOY_ADAPTER=cloudflare`, otherwise Node.
- Based on the official `tina-astro-starter`, heavily modified.

## Commands

```sh
npm run dev          # Tina local mode + Astro → http://localhost:4321, CMS at /admin (writes to src/content/**)
npm run build:local  # offline build, no TinaCloud creds needed – use this to verify changes
npm run build        # production build against TinaCloud (needs PUBLIC_TINA_CLIENT_ID + TINA_TOKEN)
npx astro check      # must stay at 0 errors / 0 warnings
npm test             # vitest unit tests for the pure modules in src/lib
```

Run `npm test`, `npm run build:local` and `npx astro check` after every change.

## Architecture

| Path | Purpose |
| --- | --- |
| `tina/config.ts` | Tina config (media root `public/uploads`, branch detection) |
| `tina/collections/*.ts` | Collections: `page` (Seiten), `hund`, `wurf`, `news` (Aktuelles), `config` (Einstellungen, global) |
| `tina/blocks/index.ts` | Page block templates (hero, text, highlights, galerie, hunde, wuerfe, news, cta, kontakt) |
| `src/content/{seiten,hunde,wuerfe,aktuelles,config}` | Content (md with frontmatter; config is JSON) |
| `src/lib/data.ts` | Tina client loaders (lists sorted via the domain modules), derived types |
| `src/lib/detailseite.ts`, `src/lib/detailseiten.ts` | Shared factory `detailseite()`, and the luchberg list: one definition per detail page collection (`seiten`, `hunde`, `wuerfe`, `aktuelles`): static paths, load + unwrap, SEO, Body, island. Page `home` is the index (served at `/`) |
| `src/lib/islands.ts` | Island registry for live visual editing, built from `detailseiten.ts` plus the global header/footer → served by `src/sites/luchberg/pages/tina-island/[name].ts` |
| `src/lib/domain/*` | Pure domain rules with colocated tests: `hund`, `wurf`, `news` (options/labels, sorting, grouping, URLs, SEO), `datum`, `slug`, `seo` (head meta fallbacks; the default site name comes from `src/sites/<id>/site.ts`). Also imported by `tina/collections/*` – no Astro/Tina imports here |
| `src/lib/farbschema.ts` | Colour scheme list (ids, labels, swatches, theme-color) for Tina, `FarbVorschau` and `BaseHead` |
| `src/components/blocks/*` | One component per block, dispatched in `Blocks.astro` via `__typename` (`PageBlocksHero`, …) |
| `src/components/islands/*Body.astro` | Detail bodies for hund/wurf/news (pages render `Blocks.astro` directly) |
| `src/layouts/Detailseite.astro` | Renders a loaded detail page: `Base` + `<TinaIsland>` + Body |
| `src/sites/luchberg/pages/`: `index.astro`, `[slug].astro`, `hunde/[slug]`, `wuerfe/[slug]`, `aktuelles/[slug]` | Thin routes (injected per `SITE_ID` by `src/multisite/integration.ts`): `getStaticPaths` + `load` + 404 + `<Detailseite>`; list pages are CMS pages built from auto-list blocks |
| `src/styles/global.css` | Design tokens + 3 colour schemes + custom utilities |

**Adding a block:** add the template in `tina/blocks/index.ts`, a component in `src/components/blocks/`, and a `case` in `Blocks.astro`. Add `data-tina-field={tinaField(obj, 'field')}` to every editable element.

**Adding a collection:** add a collection file, register it in `tina/config.ts`, add loaders and types in `data.ts`, add a `detailseite(…)` definition (factory in `src/lib/detailseite.ts`) in `detailseiten.ts` and list it in `detailseiten` (that also registers its island), then add a route like `src/sites/luchberg/pages/hunde/[slug].astro`.

## Design system

- Colour schemes are CSS variables selected by `<html data-farbe="…">`: `sonnenuntergang` (default), `neon`, `pfirsich`. The default comes from `config.farbschema`. `FarbVorschau.astro` is a review switcher, shown with `PUBLIC_FARBVORSCHAU=true` or `?farbe=…`. Adding a scheme: tokens (light + dark) in `global.css` and an entry in `src/lib/farbschema.ts`.
- Use the semantic Tailwind colours: `bg`, `surface`, `surface-2`, `fg`, `muted`, `border`, `primary`, `primary-ink`, `accent`, `accent-ink`, `dark`, `on-dark`. Use `*-ink` variants for text on light backgrounds (contrast).
- Custom utilities are defined with `@utility` (Tailwind v4 cannot `@apply` custom classes): `container-page`, `grad-bg`, `grad-text`, `grad-soft`, `btn`, `btn-primary`, `btn-secondary`, `card`, `card-hover`, `badge`. Component classes: `kicker`, `headline-line`, `prose-luchberg`.
- Rich text is rendered with `class="prose prose-lg prose-luchberg"` and `<TinaMarkdown content={…} />`.
- Fonts are self-hosted via Fontsource (Bricolage Grotesque for display, Inter for body). **No Google Fonts, no tracking, no cookies** (GDPR).
- Images are served as plain `<img>` from `public/uploads/**` (imports were pre-resized to ≤1600 px). Galleries use `Galerie.astro`. The lightbox opens any `<a data-lightbox="group">`.

## Gotchas

- **Never re-run `migration/migrate.py`.** It regenerates `src/content/**` from the old site and would overwrite Karo's edits. It stays only for reference.
- `tina/tina-lock.json` **must be committed** (TinaCloud indexes the schema from it). It is regenerated by `npm run dev`.
- `tina/__generated__/` and `public/admin/` are build output and gitignored.
- Two sibling fields with different types in different block templates break Tina's GraphQL codegen. That is why the text block's rich text is called `inhalt`, while other blocks use a string `text`.
- Tina `datetime` fields show today's date when empty. For optional dates, use a string field (see `hund.verstorben`).
- Dates are stored as ISO strings. Display them with `formatDatum()` / `formatDatumLang()` from `src/lib/domain/datum.ts` (`de-DE`, Europe/Berlin).
- Old-site URLs have 301 redirects in `astro.config.mjs` (`redirects`). Keep them.
- The contact form posts to Web3Forms when `PUBLIC_WEB3FORMS_KEY` is set, otherwise it falls back to `mailto:`.
- The old site archive lives at `../old_archive/vomluchberg_archive` (read-only reference). `httpdocs/fb` is only a Facebook-template duplicate. `caninepure.de` and `vitale-hunde.de` are separate sites and are **out of scope**. The archive also contains a `.ssh` folder and a WordPress SQL dump: don't touch or copy them.
