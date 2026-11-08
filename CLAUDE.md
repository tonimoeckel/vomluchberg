# CLAUDE.md – vomluchberg.de

Websites for **Karo (Karolin Riesing)**, owner of the ADRK Rottweiler kennel "vom Luchberg" in Glashütte OT Luchau (Saxony). One repo builds three sites (see *Multi-site* below): `luchberg` (vomluchberg.de, live), `dackel` (Rauhaardackel) and `training` (Hundetraining "Alltag kann Sport"); the last two are skeletons until slices 1 and 2 (`docs/plan/`). Toni is the technical implementer; Karo is non-technical and edits simple content herself via TinaCMS. Layout/design/structural changes are Toni's job.

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
npm run dev:dackel   # same for another site (dev:training); SITE_ID picks the site
npm run build:local  # offline build, no TinaCloud creds needed – use this to verify changes
npm run build:local:all  # luchberg, dackel, training one after another (never run two builds in parallel)
npm run build        # production build against TinaCloud (needs PUBLIC_TINA_CLIENT_ID + TINA_TOKEN); Workers Builds of a branch other than main build locally instead (scripts/build.mjs)
npx astro check      # must stay at 0 errors / 0 warnings
npm test             # vitest unit tests for the pure modules in src/lib
```

Run `npm test`, `npm run build:local` and `npx astro check` after every change (`build:local:all` when shared code or `tina/` changed). For changes that must not touch the live site, diff `dist/client` of the luchberg build before/after (`docs/plan/00-multisite.md` §3).

## Architecture

| Path | Purpose |
| --- | --- |
| `src/sites/index.ts`, `src/sites/<id>/site.ts` | Site registry (`luchberg`, `dackel`, `training`): one build = one site, chosen by `SITE_ID` (default `luchberg`; unknown ids fail). A site definition holds its default name, its admin label prefix, the Tina collections it owns, its 301 `redirects` and its `wranglerConfig` (worker name; luchberg uses the root `wrangler.jsonc`) |
| `src/sites/{dackel,training}/` | Everything of the new sites: `pages/`, `public/`, `layouts/`, `components/` (`Blocks.astro` dispatches on `blockName()`), `lib/{data,detailseiten,islands}.ts`, `styles/global.css`, `wrangler.jsonc`. Content in `src/content/<id>/`, images in `public/uploads/<id>/` |
| `src/sites/<id>/pages/**`, `src/sites/<id>/public/**` | Routes and root files (favicons) of a site. Pages are injected with Astro's file-routing rules by `src/multisite/integration.ts`; there is no `src/pages/`. Root files are copied into the build output and served in dev |
| `src/multisite/*` | The multi-site mechanism: route injection, per-site public files, `/robots.txt` for every site, `virtual:multisite` (`siteId`, `noindex`) |
| `tina/config.ts`, `tina/schema.ts` | Tina config (media root `public/uploads`, branch detection); `schema.ts` lists the collections of **all** sites |
| `tina/collections/*.ts` | luchberg collections: `page` (Rottweiler · Seiten), `hund`, `wurf`, `news` (Aktuelles), `config` (Einstellungen, global); shared field groups in `fields.ts` |
| `tina/sites/router.ts`, `tina/sites/collections.ts`, `tina/sites/<id>/*.ts` | `siteRouter()` (preview only in the owning site's admin), collection factories for new sites, the `dackel*` / `training*` collections |
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

**Adding a collection (luchberg):** add a collection file, register it in `tina/schema.ts` and in the site's `collections` (`src/sites/luchberg/site.ts`), add loaders and types in `data.ts`, add a `detailseite(…)` definition (factory in `src/lib/detailseite.ts`) in `detailseiten.ts` and list it in `detailseiten` (that also registers its island), then add a route like `src/sites/luchberg/pages/hunde/[slug].astro`. For `dackel`/`training` the same steps happen in `tina/sites/<id>/` and `src/sites/<id>/`; name the collection `<id><Name>`, path `src/content/<id>/…`, label "Dackel · …"/"Training · …", router `siteRouter('<id>', …)` (all checked by `src/sites/schema.test.ts`). Run `npm run dev` once and commit `tina/tina-lock.json`.

## Design system (luchberg)

The new sites have their own tokens, fonts and utilities in `src/sites/<id>/styles/global.css` (placeholders until slices 1 and 2); the token names below are shared.


- Colour schemes are CSS variables selected by `<html data-farbe="…">`: `sonnenuntergang` (default), `neon`, `pfirsich`. The default comes from `config.farbschema`. `FarbVorschau.astro` is a review switcher, shown with `PUBLIC_FARBVORSCHAU=true` or `?farbe=…`. Adding a scheme: tokens (light + dark) in `global.css` and an entry in `src/lib/farbschema.ts`.
- Use the semantic Tailwind colours: `bg`, `surface`, `surface-2`, `fg`, `muted`, `border`, `primary`, `primary-ink`, `accent`, `accent-ink`, `dark`, `on-dark`. Use `*-ink` variants for text on light backgrounds (contrast).
- Custom utilities are defined with `@utility` (Tailwind v4 cannot `@apply` custom classes): `container-page`, `grad-bg`, `grad-text`, `grad-soft`, `btn`, `btn-primary`, `btn-secondary`, `card`, `card-hover`, `badge`. Component classes: `kicker`, `headline-line`, `prose-luchberg`.
- Rich text is rendered with `class="prose prose-lg prose-luchberg"` and `<TinaMarkdown content={…} />`.
- Fonts are self-hosted via Fontsource (Bricolage Grotesque for display, Inter for body). **No Google Fonts, no tracking, no cookies** (GDPR).
- Images are served as plain `<img>` from `public/uploads/**` (imports were pre-resized to ≤1600 px). Galleries use `Galerie.astro`. The lightbox opens any `<a data-lightbox="group">`.

## Multi-site

Plan and reasoning: `docs/plan/00-multisite.md` (rulings R1–R7 in `docs/plan/README.md` win over the slice files).

- **One build = one site.** `SITE_ID` (`luchberg` default, `dackel`, `training`) selects the routes (`src/sites/<id>/pages/**`, injected by `src/multisite/integration.ts`), root files, redirects and the worker config. Nothing of the other sites ends up in a build.
- **Where things go:** everything site-specific of a new site lives in `src/sites/<id>/`, `src/content/<id>/`, `public/uploads/<id>/` and `tina/sites/<id>/`. Shared code must be pure (`src/lib/domain/*`, `src/lib/*.ts`, `src/multisite/*`) or a component that only uses the semantic tokens (`BaseHead`, `Galerie`, `Lightbox`, `ui/Icon`). The Rottweiler site keeps its legacy locations (`src/content/{seiten,hunde,…}`, `src/components`, `src/lib`); it is not moved.
- **One Tina schema for all sites.** `tina/schema.ts` always registers every collection. **The schema must never depend on `SITE_ID`** (TinaCloud indexes one schema; the lock must be identical for all three workers). Only `ui` functions may read the site: `siteRouter(owner, path)` gives a live preview only in the owning site's `/admin`; other sites' documents are edited there as plain forms. Tina's admin bundle only sees `TINA_PUBLIC_*` env vars, so `tina/config.ts` copies `SITE_ID` to `TINA_PUBLIC_SITE_ID` while the CLI loads it.
- **Lock file:** `tina-lock.json` is only regenerated by `npm run dev` (any `SITE_ID`), not by `build:local`. Run it after every schema change and commit the lock.
- **Sibling-field rule is per collection:** inside one page collection's block templates the same field name must have the same type; different collections (`page` vs `dackelPage`) are independent GraphQL types.
- **Block typenames are prefixed** with the collection (`PageBlocksHero`, `DackelPageBlocksHero`). New sites dispatch on `blockName(__typename)` (`src/lib/tina-typename.ts`).
- **Styles per site:** each site's `styles/global.css` defines the same semantic tokens (`--bg` … `--on-dark`, `--radius`, `--grad*`) with its own values. New sites use `@import 'tailwindcss' source(none)` plus `@source` for their own folder and the shared components. Luchberg's `src/styles/global.css` excludes `docs/`, `migration/`, root `*.md` and the other sites' folders with `@source not` (exclude other non-site folders the same way); otherwise their class names leak into its inlined CSS.
- **Builds run sequentially:** two Tina builds in parallel fail ("Datalayer server is busy on port 9000").
- **Workers:** `vomluchberg`, `vomluchberg-dackel`, `vomluchberg-training`, all with build command `npm run build`, deploy command `npx wrangler deploy` and Worker Previews on. Non-luchberg sites pass `configPath: src/sites/<id>/wrangler.jsonc` to the adapter; the build writes `dist/server/wrangler.json` and `.wrangler/deploy/config.json`, which both `wrangler deploy` and `wrangler preview` follow.
- **noindex:** `SITE_NOINDEX=true` makes a build disallow robots and add meta `noindex` (new sites on `*.workers.dev` before launch). Builds of a branch other than `main` (`WORKERS_CI_BRANCH`, i.e. Worker Previews) are noindex automatically; `SITE_NOINDEX=false` overrides that.
- Uploads are not pruned per site: every worker ships all of `public/uploads`. `src/sites/content.test.ts` fails on references to missing images and warns when a new site uses images outside its own folder.

## Pull requests

- After opening a PR (or pushing to one), **subscribe to its activity and watch it without being asked**: failing checks, review comments, merge conflicts. If the cause is in the repo, reproduce it, fix it and push (with the usual checks). If it is not (e.g. a Cloudflare dashboard setting), say so once on the PR and tell Toni what is needed. Keep watching until the PR is merged or closed.
- Base new PRs on `main`. Stacked PRs (base = another PR's branch) get lost when the lower PR is merged first, as happened with #4.

## Gotchas

- **Never re-run `migration/migrate.py`.** It regenerates `src/content/**` from the old site and would overwrite Karo's edits. It stays only for reference.
- `tina/tina-lock.json` **must be committed** (TinaCloud indexes the schema from it). It is regenerated by `npm run dev`.
- `tina/__generated__/` and `public/admin/` are build output and gitignored.
- Two sibling fields with different types in different block templates of one page collection break Tina's GraphQL codegen. That is why the text block's rich text is called `inhalt`, while other blocks use a string `text`.
- Tina `datetime` fields show today's date when empty. For optional dates, use a string field (see `hund.verstorben`).
- Dates are stored as ISO strings. Display them with `formatDatum()` / `formatDatumLang()` from `src/lib/domain/datum.ts` (`de-DE`, Europe/Berlin).
- Old-site URLs have 301 redirects in `src/sites/luchberg/site.ts` (`redirects`, applied only to the luchberg build). Keep them.
- The contact form posts to Web3Forms when `PUBLIC_WEB3FORMS_KEY` is set, otherwise it falls back to `mailto:`.
- The old site archive lives at `../old_archive/vomluchberg_archive` (read-only reference). `httpdocs/fb` is only a Facebook-template duplicate. `caninepure.de` and `vitale-hunde.de` are separate sites and are **out of scope**. The archive also contains a `.ssh` folder and a WordPress SQL dump: don't touch or copy them.
