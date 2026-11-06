# Slice 0 – Multi-site foundation

Status: **PR A and PR B implemented** (2026-11-06), step 12 (infrastructure) open. Planned 2026-11-05. Spikes were run on a throwaway branch (not
committed); their results are in [Spike results](#spike-results). Slices 1 (`dackel`) and 2
(`training`) build on the mechanism described here.

## Implementation status

- **PR A (steps 1–7): implemented** on `claude/plan-00-multisite` (one commit per step). Every
  step was checked with `npm test`, `astro check` (0/0/0) and a full dist diff against the
  pre-change build (Node and Cloudflare adapter): identical, except the new `robots.txt` from
  step 7. Deviations from the plan text: the registry only contains `luchberg` until step 9 adds
  the other sites (so `SITE_ID=dackel` fails fast for now); the noindex meta is
  `noindex, nofollow`; the build's site id/noindex flag reach components via `virtual:multisite`.
- Finding while verifying: Tailwind 4's automatic source detection also scans Markdown files
  (`docs/**`, `CLAUDE.md`, `README.md`). Class-like words in docs end up in the CSS inlined into
  every page – the plan commit alone changed the CSS of all 41 pages. **Fixed** in a follow-up
  commit: `src/styles/global.css` excludes `docs/`, `migration/` and the root `*.md` files via
  `@source not`. That removed only the unused `.table` and `.visible` rules (49 bytes per page);
  from now on docs edits don't touch the site's CSS.
- **PR B (steps 8–10) + CF-01: implemented** on `claude/impl-00-multisite-pr-b` (one commit per step,
  plus CF-01 and the optional automatic noindex). Every commit was checked with `npm test`, `astro check`
  (0/0/0), `build:local` for all three sites and the luchberg dist diff: `dist/client` identical for the
  Node and the Cloudflare adapter (only the admin bundle changes: new labels). Results and deviations:
  - **Admin bundle env (finding):** Tina's admin bundle replaces `process.env` with the `TINA_PUBLIC_*`
    variables only, so a router reading `process.env.SITE_ID` (as sketched in 2.6) would always see
    `luchberg`. `tina/config.ts` calls `exposeSiteId()`, which copies `SITE_ID` to
    `TINA_PUBLIC_SITE_ID` while the CLI loads the config in Node; `adminSiteId()` reads that first.
    Verified in the built admin (`TINA_PUBLIC_SITE_ID:"training"`) and in `npm run dev:dackel`: the
    dackel home page opens with live preview and live edits, a Rottweiler page opens as a plain form.
  - **Schema list** lives in `tina/schema.ts` (importable by tests without the Tina runtime);
    `tina/config.ts` only registers it. Site definitions gained `adminLabel` ("Rottweiler", "Dackel",
    "Training") and `collections` (the Tina collections a site owns) – this is the "which collection
    belongs to which site" helper slice 1 asked for (01-dackel §3, item 6). `schema.test.ts` checks
    ownership, names, paths, labels, one global config per site, SITE_ID independence and that routers
    preview only in the owner's admin.
  - **New collections:** `dackelPage`, `dackelConfig`, `trainingPage`, `trainingConfig`, built with the
    factories in `tina/sites/collections.ts` (`seitenCollection`, `einstellungenCollection`,
    `basisEinstellungen` = `website` + `kontakt` + `nav`). Starter blocks are `hero`, `text`, `cta`
    (not `kontakt`: its component is Rottweiler-specific and slice 2 excludes it; the slices add their
    own contact/inquiry blocks). Slice 1 uses the name `dackelPage` (not `dackelSeite`).
  - **Skeleton code** per site: own block components (luchberg's are typed to `PageBlocks*` and carry
    the Rottweiler look), header/footer islands on `<id>Config`, `<html data-site="<id>">`, neutral
    placeholder tokens (zinc greys, system fonts, no gradients), placeholder favicons (grey tile with
    "D" / "A"). Each site's worker only contains its own islands (`/tina-island/page` on dackel →
    `Unknown island`).
  - **No `.gitkeep`** in `public/uploads/<id>/`: it would be copied into every build, including
    luchberg's. `public/uploads/training/` already has slice 2's images; `uploads/dackel/` appears with
    slice 1's photos (Tina can also create the folder).
  - **Content test** (`src/sites/content.test.ts`): a reference to a missing image fails for every
    site (all 187 luchberg references resolve); images outside a new site's own folder only warn.
  - **CF-01:** `previews: {}` + `preview_urls: true` in all three Wrangler files. `wrangler deploy
    --dry-run` per site uses `dist/server/wrangler.json` with the right name (luchberg 4722 KiB / 998
    KiB gzip, dackel and training skeletons 2683 KiB / 651 KiB gzip). `wrangler preview` (4.140.0) also
    follows `.wrangler/deploy/config.json` (source: `useConfigRedirectIfAvailable: true`; run without a
    token it logs "Using redirected Wrangler configuration … dist/server/wrangler.json" before failing on
    auth), so no `--config` is needed.
  - **Automatic noindex (R3 / slice 3 I-4):** builds with `WORKERS_CI_BRANCH` ≠ `main` are noindex;
    `SITE_NOINDEX` (true/false) overrides. `noindexFromEnv()` in `src/multisite/robots.ts`, tested.
- Step 12 (create the two workers, TinaCloud site URLs, rebuild check): open, see slice 3 CF-02…CF-07.

## TL;DR

- **D1–D4 hold.** One Astro project builds exactly one site per `SITE_ID`
  (`luchberg` | `dackel` | `training`). A small local integration injects the routes of
  `src/sites/<id>/pages/**` with `injectRoute`, so each site has normal Astro file-based routing
  and nothing of the other sites ends up in its build.
- **One Tina schema with all collections of all sites, always** – independent of `SITE_ID`. The
  schema (and with it `tina-lock.json`) must be identical in all three builds or TinaCloud's
  schema check fails. Only `ui` functions (the preview `router`) are site-aware.
- **Visual editing per site:** Tina's `router` can only return paths on the admin's own origin.
  So each site's `/admin` live-previews **its own** collections. Collections of the other two
  sites are still editable there, as plain forms without preview.
- **Rottweiler site: no content or upload moves.** Only its 7 route files move to
  `src/sites/luchberg/pages/`. The spike showed all 41 pages, the sitemap and `_redirects` stay
  byte-identical. New sites use `src/content/<id>/` and `public/uploads/<id>/`.
- **Three Workers** from the same repo, same build command, the site picked by the build
  variable `SITE_ID`. The worker name per site comes from `src/sites/<id>/wrangler.jsonc` via the
  Cloudflare adapter's `configPath` (verified). Each worker is ~1 MiB gzip (~4.7 MiB uncompressed). Cloudflare removed the compressed-size limit on 2026-09-04; only 64 MiB uncompressed counts now (see `03-betrieb.md` §0).

## 1. Decision and alternatives

### Options compared

| Criterion | **(a) one Astro project + `SITE_ID` + `injectRoute`** (chosen) | (b) npm workspaces monorepo (3 apps + shared package) | (c) one domain, path prefixes (`/dackel/…`, `/training/…`) |
| --- | --- | --- | --- |
| TinaCloud: one project, one `tina-lock.json` | ✅ one `tina/` folder, all collections, paths relative to repo root | ❌ one Tina config can't serve three app roots: collection paths and the media `publicFolder` are relative to the one Tina root, so either 3 Tina projects (3 logins, 3 locks) or awkward `../` paths Tina doesn't support | ✅ trivially |
| Branch detection (`WORKERS_CI_BRANCH`) | ✅ unchanged | ⚠️ per app | ✅ unchanged |
| Media root | ✅ one root `public/uploads`, per-site subfolders | ❌ one root vs. three `public/` dirs | ✅ |
| Visual-editing islands `/tina-island/[name]` | ✅ one route per site, registry contains only that site's islands (verified) | ✅ per app | ✅ one registry for all |
| Cloudflare Workers Builds (3 workers, 1 repo) | ✅ same root dir and build command, `SITE_ID` per worker, watch paths per worker | ⚠️ works with root dirs, but Wrangler's workspace support is "limited" per the Cloudflare docs | ✅ one worker – but no separate domains |
| Worker size limit (was 3 MiB gzip, now 64 MiB uncompressed) | ✅ ~995 KiB per site (measured) | ✅ | ⚠️ one worker carries all three sites' island code |
| Sitemap / robots / canonical per site | ✅ automatic: each build only contains its own pages, `site` = its `SITE_URL` | ✅ | ❌ one sitemap, one canonical host; the dachshund site is not "its own site" |
| 301 `redirects` only on luchberg | ✅ redirects live in the site definition | ✅ | ⚠️ manual scoping |
| Dev experience | ✅ `npm run dev` (luchberg) / `npm run dev:dackel` / `npm run dev:training` | ⚠️ three dev servers + Tina in one of them | ✅ one dev server |
| Tests, `astro check` | ✅ one vitest + one check over everything | ⚠️ per package | ✅ |
| Karo's requirement "separate site, findable on its own, completely different design" | ✅ | ✅ | ❌ |

**(c)** fails the core requirement (own domain, own identity) – it stays only as an emergency
fallback if the multi-worker setup ever had to be dropped. **(b)** fights TinaCloud (one project
per repo, one schema root, one media root) and doubles the toolchain. **(a)** keeps everything
Toni already knows and the spike showed it works without touching the live site's output.

Variant considered inside (a): a single catch-all route (`src/pages/[...path].astro`) that
dispatches to the current site's definitions. Rejected: it hides routing in code, makes per-site
special pages (e.g. a training "Angebote" overview with its own layout) awkward, and changes how
the live site's routes are written. `injectRoute` keeps plain file-based routing per site.

### Validated decisions

| # | Verdict | Notes |
| --- | --- | --- |
| D1 | ✅ **confirmed** | `SITE_ID` env var, validated (unknown id → build error), default `luchberg`. |
| D2 | ✅ **confirmed, with a caveat** | One TinaCloud project, one schema. Caveat: live preview of a site only works in **that site's** `/admin` (see 2.6). All collections are editable in every `/admin`. |
| D3 | ✅ **confirmed** | Three workers, same repo/build command; per-site `wrangler.jsonc` via the adapter's `configPath`. Settled names (R1): `vomluchberg`, `vomluchberg-dackel`, `vomluchberg-training` (open question T1). |
| D4 | ✅ **confirmed, refined** | Luchberg content and uploads **stay where they are – permanently, unless a later need appears**. New sites: `src/content/<id>/**`, `public/uploads/<id>/**`. Uploads are **not** pruned per site (all images ship with every site; see 2.4). |

## 2. Target design

### 2.1 Directory layout

```text
astro.config.mjs                 # reads SITE_ID, takes redirects/adapter config from the site definition
wrangler.jsonc                   # luchberg worker (unchanged, Workers Builds checks this file)
tina/
  config.ts                      # registers ALL collections of ALL sites (schema must not depend on SITE_ID)
  collections/*.ts               # luchberg collections (unchanged paths and names)
  blocks/index.ts                # block templates (reusable by other sites' page collections)
  sites/
    router.ts                    # siteRouter(owner, fn): preview router that is undefined on foreign sites
    dackel/*.ts                  # dackelPage, dackelConfig, … (slice 1 adds its model)
    training/*.ts                # trainingPage, trainingConfig, … (slice 2 adds its model)
src/
  multisite/                     # the mechanism (shared)
    integration.ts               # injectRoute for src/sites/<id>/pages/**, robots.txt, per-site public files
    routes.ts (+ .test.ts)       # file path → route pattern (pure)
    robots.txt.ts                # robots route injected for every site
  sites/
    index.ts (+ .test.ts)        # SITE_IDS, resolveSiteId(), registry of site definitions (pure TS)
    luchberg/
      site.ts                    # id, name, redirects (moved from astro.config.mjs)
      pages/                     # index, [slug], 404, hunde/, wuerfe/, aktuelles/, tina-island/[name].ts
      public/                    # favicon.ico, icon-192.png, apple-touch-icon.png (moved from public/)
    dackel/
      site.ts, wrangler.jsonc
      pages/                     # index, [slug], 404, tina-island/[name].ts (+ what slice 1 needs)
      public/                    # own favicons
      layouts/, components/, lib/{data,detailseiten,islands}.ts, styles/global.css
    training/                    # same shape as dackel
  lib/
    domain/*                     # shared pure rules (D6), unchanged
    detailseite.ts               # shared: the generic detailseite() factory + LoadedPage types
    tina-typename.ts (+ test)    # shared: blockName('DackelPageBlocksHero') → 'Hero'
    data.ts, detailseiten.ts, islands.ts, farbschema.ts   # luchberg (stay in place)
  components/                    # luchberg components (stay in place)
    BaseHead.astro               # becomes shared (theme colours/favicons as props)
    Galerie.astro, Lightbox.astro, ui/Icon.astro          # shared by convention (semantic tokens only)
  layouts/                       # luchberg layouts (stay in place)
  styles/global.css              # luchberg tokens (stays in place)
  content/
    seiten/ hunde/ wuerfe/ aktuelles/ config/             # luchberg content (stays in place)
    dackel/{seiten,config,…}/     # new
    training/{seiten,config,…}/   # new
public/
  uploads/                       # luchberg folders as today + uploads/dackel/, uploads/training/
  admin/                         # Tina build output (gitignored)
```

**Rule of thumb for the other slices:** everything site-specific of a new site lives in
`src/sites/<id>/` (+ `src/content/<id>/`, `public/uploads/<id>/`, `tina/sites/<id>/`). Code is
shared only if it is pure (`src/lib/domain/*`, `src/lib/*.ts` helpers, `src/multisite/*`) or a
component that only uses the semantic tokens (2.5). The luchberg site stays in the legacy root
locations; moving its components into `src/sites/luchberg/` is optional cleanup (step 11), not a
prerequisite.

### 2.2 Site selection and routes

- `src/sites/index.ts` (pure, no Astro/Tina imports – importable from `astro.config.mjs`, `tina/`
  and tests):

  ```ts
  export const SITE_IDS = ['luchberg', 'dackel', 'training'] as const;
  export type SiteId = (typeof SITE_IDS)[number];
  export function resolveSiteId(raw: string | undefined): SiteId; // '' / undefined → 'luchberg', unknown → throws
  export const sites: Record<SiteId, SiteDefinition>;               // { id, name, redirects, wranglerConfig? }
  ```

  `astro.config.mjs` imports this TS module directly (verified: Astro loads the config through
  Vite, `.ts` imports work).
- `multisite(siteId)` integration, `astro:config:setup`: walks `src/sites/<id>/pages/**` and calls
  `injectRoute({ pattern: routePattern(rel), entrypoint })`. `routePattern` follows Astro's file
  rules (`index` segments dropped, extension stripped, `[slug]`/`[...rest]` kept). `prerender`,
  `getStaticPaths` and `export const prerender = false` in the files keep working (verified for
  static pages and the on-demand island route, in build and dev).
- `src/pages/` is removed. Astro builds fine without it (verified).
- `redirects: sites[SITE_ID].redirects` – luchberg keeps its 23 entries, the others start empty.
- Each site has its own `tina-island/[name].ts` (5 lines) importing its own registry. That keeps
  the other sites' components out of the worker bundle without any virtual-module/alias tricks.

### 2.3 Data loading, detail pages, islands

- `src/lib/detailseiten.ts` is split: the generic `detailseite()` factory and the `LoadedPage` /
  `Detailseite` types move to `src/lib/detailseite.ts`. The luchberg definitions (`seiten`,
  `hunde`, `wuerfe`, `aktuelles`, `detailseiten`, `detailIslands`) stay in `detailseiten.ts`.
  The spike used the factory unchanged for `dackelPage` (typed, `astro check` 0/0).
- Each new site has `src/sites/<id>/lib/data.ts` (loaders on its own collections via the shared
  generated client: `client.queries.dackelPage(…)`), `lib/detailseiten.ts` and `lib/islands.ts`
  (its detail islands + its own header/footer islands on `<id>Config`).
- `src/layouts/Detailseite.astro` stays luchberg's; new sites have their own (it is 10 lines and
  depends on the site's `Base`).
- **Block dispatch:** the `__typename` of a block is prefixed with the collection name
  (`PageBlocksHero` vs `DackelPageBlocksHero`, verified). Luchberg's `Blocks.astro` stays as is.
  New sites dispatch on `blockName(block.__typename)` (`'Hero'`, `'Text'`, …) from
  `src/lib/tina-typename.ts`, so a site can reuse shared block templates and components without
  hard-coding another collection's prefix.

### 2.4 Content, uploads, per-site static files

- Content: `src/content/<id>/<collection-folder>/`. Tina collection paths must not overlap; the
  luchberg paths (`src/content/seiten`, …) and the new ones (`src/content/dackel/seiten`, …) don't.
- Uploads: Tina has one media root (`public/uploads`). New sites use the subfolders
  `uploads/dackel/` and `uploads/training/`. **No per-site pruning** of `uploads/`: every worker
  ships all images (~53 MB, ~220 files today; limits are 20 000 files and 25 MiB per file, and
  assets upload incrementally by hash). Reason: Karo can't be prevented from putting an image in
  the "wrong" folder, and a pruned build would silently show a broken image. Pruning was spiked
  (works, 6 lines in `astro:build:done`) and can be switched on later if wanted.
  A vitest check (step 8) warns Toni when a new site's content references images outside its own
  folder, so folders stay tidy without breaking Karo's builds.
- Root static files per site (favicons, later e.g. `google…html` verification files):
  `src/sites/<id>/public/**` is copied into the build output root in `astro:build:done`
  (verified) and served by a small dev middleware (`configureServer`; not served in dev yet in the
  spike – step 3). Luchberg's three favicon files move from `public/` to
  `src/sites/luchberg/public/`, so `public/` only holds `uploads/` (+ generated `admin/`).

### 2.5 Head, design tokens, colour schemes

- `BaseHead.astro` becomes shared: props `title`, `description`, `image`, `themeColor
  {light,dark}`, `noindex?`, `icons?` (default paths `/favicon.ico`, `/icon-192.png`,
  `/apple-touch-icon.png`). Luchberg passes `farbschema(...).themeColor`; output stays identical.
- `headMeta()` in `src/lib/domain/seo.ts`: the hard-coded fallback name `'Rottweiler vom
  Luchberg'` becomes a parameter (each site passes its own default name).
- **Design token contract:** every site's `styles/global.css` defines the **same semantic CSS
  variables** (`--bg`, `--surface`, `--surface-2`, `--fg`, `--muted`, `--border`, `--primary`,
  `--primary-ink`, `--accent`, `--accent-ink`, `--dark`, `--on-dark`, `--radius`, `--grad*`) and
  maps them to the same Tailwind theme names. Values, fonts, utilities and layouts differ freely
  (D5). That way shared components (`Galerie`, `Lightbox`, `Icon`) look native on every site.
- `farbschema.ts` and the three schemes stay luchberg-only. A new site that wants a switchable
  scheme gets its own list; the pattern is reusable, the data is not shared.
- **Tailwind sources:** Tailwind 4 scans the whole project by default, and pages use
  `inlineStylesheets: 'always'`, so other sites' classes would bloat every page. Each site's CSS
  restricts sources: new sites use `@import 'tailwindcss' source(none);` plus `@source` for
  `src/sites/<id>`, the shared components and `src/lib`. Luchberg's `global.css` adds
  `@source not "../sites/dackel"` and `@source not "../sites/training"` (step 9), which keeps its
  CSS identical. (Not spiked; the build-diff check in step 9 covers it.)

### 2.6 Tina: one schema, per-site collections

- `tina/config.ts` always registers every collection. **The schema must not depend on
  `SITE_ID`** – the generated `_schema.json`/`_graphql.json`/`_lookup.json` were byte-identical
  for `SITE_ID=luchberg` and `SITE_ID=dackel` in the spike because only `ui.router` differed
  (functions are not part of the schema). Never filter collections by site.
- Naming: luchberg keeps `page`, `hund`, `wurf`, `news`, `config` (renaming would change GraphQL
  types, `__typename`s and generated queries for nothing). New collections are camelCase with the
  site prefix: `dackelPage`, `dackelConfig`, `dackelHund`, …, `trainingPage`, `trainingConfig`,
  `trainingAngebot`, …
- Labels are prefixed so Karo sees which site she is editing: "Rottweiler · Seiten",
  "Dackel · Seiten", "Training · Angebote", … (luchberg labels change, its data doesn't).
- Every site has its own `<id>Config` collection with `ui.global: true` (several global
  collections in one schema: verified in the spike, codegen and dev admin OK). Shared field groups
  (contact data, social links, menu) are exported from `tina/collections/fields.ts` and composed
  per site; each site's config only carries what it renders.
- **Sibling-field gotcha:** it applies **within one union** (the block templates of one page
  collection). Different collections are independent GraphQL types: in the spike `dackelPage`
  had a `text` template whose `inhalt` was a `string` while `page`'s `inhalt` is `rich-text` –
  codegen and build passed. Rule for slices 1/2: inside one collection's templates, same field
  name ⇒ same type; across collections, anything goes.
- **Preview router:** `tina/sites/router.ts`

  ```ts
  /** Preview path of a document, only in the admin of the site that owns the collection. */
  export const siteRouter = (owner: SiteId, path: (doc) => string | undefined) =>
    ({ document }) => (adminSiteId() === owner ? path(document) : undefined);
  // adminSiteId() reads TINA_PUBLIC_SITE_ID (set from SITE_ID by tina/config.ts) – the admin bundle
  // only sees TINA_PUBLIC_* variables (implementation finding, see Implementation status).
  ```

  Tina's admin turns the router result into `#/~/<path>` on its **own origin** (checked in
  `tinacms` source) – absolute URLs to another domain are not supported. `@tinacms/astro`
  supports a cross-origin admin (`PUBLIC_TINA_ADMIN_ORIGIN`), but the admin's router can't point
  there, so a single central admin with live preview of all three domains is not possible.
  Result: on `vomluchberg.de/admin` Karo edits Rottweiler pages with live preview, and dachshund
  documents as forms (saving works, preview doesn't). With preview: `<dackel-domain>/admin`.
  Question for Karo in `fragen-an-karo.md`.
- `tina-lock.json` is only regenerated by `tinacms dev` (`npm run dev`), **not** by
  `build:local` (verified). Every step that touches the schema must run `npm run dev` once and
  commit the lock.
- Media: unchanged (`mediaRoot: 'uploads'`). Karo navigates to the `dackel` / `training` folder
  in the media manager.
- TinaCloud project settings: add every site URL (3 production domains + `*.workers.dev` URLs)
  to the project's site URLs so login/CORS works on every `/admin` (step 12, verify in the
  TinaCloud dashboard).

### 2.7 Scripts, CI, adapters, deployment

- `package.json`:

  ```json
  "dev": "tinacms dev -c \"astro dev\"",
  "dev:dackel": "SITE_ID=dackel npm run dev",
  "dev:training": "SITE_ID=training npm run dev",
  "build": "tinacms build --content=local -c \"astro build\"",
  "build:local": "tinacms build --local --skip-cloud-checks -c \"astro build\"",
  "build:local:dackel": "SITE_ID=dackel npm run build:local",
  "build:local:training": "SITE_ID=training npm run build:local",
  "build:local:all": "npm run build:local && npm run build:local:dackel && npm run build:local:training"
  ```

  Builds must run **sequentially**: two Tina builds in parallel fail with "Datalayer server is
  busy on port 9000" (hit in the spike). `build:local:all` overwrites `dist/` each time; it is a
  smoke test, not an artefact build. (`VAR=x cmd` is POSIX shell syntax; fine on macOS/Linux and
  Workers Builds – see T3.)
- Adapter: logic unchanged (`WORKERS_CI`/`CF_PAGES`/`DEPLOY_ADAPTER`). For non-luchberg sites the
  Cloudflare adapter gets `configPath: 'src/sites/<id>/wrangler.jsonc'` – the generated
  `dist/server/wrangler.json` then carries that worker's `name` (verified: `vomluchberg-dackel`)
  and `npx wrangler deploy` (via `.wrangler/deploy/config.json`) deploys the right worker.
  Luchberg keeps the root `wrangler.jsonc`.
- Workers Builds checks the `name` in the root directory's Wrangler file against the connected
  worker. Cloudflare's docs say Wrangler ≥ 3 handles a mismatch by overriding the name with
  `WRANGLER_CI_OVERRIDE_NAME`, and Workers Builds may otherwise open an auto-fix PR that renames
  the root file. To verify when the dachshund worker is first connected (step 12). Fallback if
  it misbehaves: Wrangler environments in the root file (`env.dackel`, worker
  `vomluchberg-dackel`) with `CLOUDFLARE_ENV=dackel` at build time.
- Per worker (Workers Builds → Settings → Builds), all on branch `main`, root directory `/`:

  | Worker | Build command | Deploy command | Build variables |
  | --- | --- | --- | --- |
  | `vomluchberg` | `npm run build` | `npx wrangler deploy` | (as today) `SITE_URL`, Tina creds, `PUBLIC_WEB3FORMS_KEY`, `PUBLIC_FARBVORSCHAU` – `SITE_ID` may stay unset (defaults to `luchberg`) |
  | `vomluchberg-dackel` | `npm run build` | `npx wrangler deploy` | `SITE_ID=dackel`, `SITE_URL=https://…workers.dev` (later domain), same Tina creds, own `PUBLIC_WEB3FORMS_KEY`, `SITE_NOINDEX=true` until launch |
  | `vomluchberg-training` | `npm run build` | `npx wrangler deploy` | `SITE_ID=training`, analogous |

- **Build watch paths** (exclude lists; everything else triggers):
  - all workers exclude `docs/**`, `migration/**`, `*.md` at the root;
  - `vomluchberg` also excludes `src/sites/dackel/**`, `src/sites/training/**`,
    `src/content/dackel/**`, `src/content/training/**`, `public/uploads/dackel/**`,
    `public/uploads/training/**`;
  - `vomluchberg-dackel` also excludes `src/sites/{luchberg,training}/**`,
    `src/content/{seiten,hunde,wuerfe,aktuelles,config,training}/**`,
    `public/uploads/training/**` (luchberg upload folders are not excluded – they ship with
    every site);
  - `vomluchberg-training` analogous.
  - `tina/**` is **never** excluded: every `/admin` must carry the current schema.

  Workers Builds on the free plan runs one build at a time; a shared change queues three builds
  (~2–3 min each). Karo's content saves only rebuild their own site.
- `robots.txt` (injected for every site): `Allow: /` + `Sitemap: <SITE_URL>/sitemap-index.xml`;
  with `SITE_NOINDEX=true` it is `Disallow: /` and `BaseHead` adds `<meta name="robots"
  content="noindex">`. This keeps the `*.workers.dev` previews out of Google until the domains
  exist (slice 3 removes the flag). Luchberg gets a `robots.txt` for the first time (only
  addition to its output).
- Sitemap and canonical: nothing to do. Each build only contains its own pages, and `site` comes
  from its `SITE_URL` (verified: dackel sitemap lists `/` and `/ueber-uns/` only).

## 3. Migration path for the live Rottweiler site

What changes for `vomluchberg.de`: its route files move (no URL change), redirects move into
`src/sites/luchberg/site.ts`, favicons move into `src/sites/luchberg/public/`, `BaseHead` gets
props, collection labels get the "Rottweiler · " prefix, and it gains a `robots.txt`.
What does **not** change: URLs, the 23 redirects, content files, Tina collection names and paths
(so document IDs), upload paths, the worker, its build settings and `wrangler.jsonc`.

**Moving its content to `src/content/luchberg/` (D4): not now, and not planned.** Costs vs. gain:

| | Content only (`git mv` 41 files, 5 collection paths) | Content + uploads |
| --- | --- | --- |
| Tina document paths / IDs | change → TinaCloud reindex, lock regenerated | same |
| Karo's open work | an edit open in the admin during the switch saves to the old path → conflict/lost edit; needs a "please don't edit" window | same |
| Image references | none | ~220 images moved, every `/uploads/…` reference in 33 md/json files rewritten, old image URLs (Google Images, shared links) break or need redirects |
| Merge risk | rename + Karo's concurrent edits on `main` | high |
| Gain | symmetric folders | symmetric folders |

The asymmetry is documented (CLAUDE.md, this file) and covered by tests (collection paths
unique and non-overlapping). If ever wanted, the content-only move is one isolated commit plus a
lock regeneration in an agreed editing pause.

**Safety net for every step touching luchberg:** build before and after, compare the output:

```sh
git stash -u && npm run build:local && cp -r dist /tmp/dist-before && git stash pop
npm run build:local
diff -r -x admin -x _astro /tmp/dist-before/client dist/client   # expect no output (except new robots.txt from step 7)
```

With the default Node adapter the output is in `dist/client`; HTML is identical across adapters
(spike).

## 4. Implementation steps (commit-sized)

Every step ends with `npm test`, `npm run build:local` and `npx astro check` (0 errors /
0 warnings). Steps marked 🔍 also run the dist diff from section 3 (expected: identical).
Steps marked 🔒 touch the Tina schema: run `npm run dev` once and commit `tina/tina-lock.json`.

1. **Site registry and `SITE_ID`** 🔍
   Files: `src/sites/index.ts`, `src/sites/index.test.ts`, `src/sites/luchberg/site.ts`
   (redirects moved from `astro.config.mjs`), `astro.config.mjs`.
   Tests: `resolveSiteId` (default, valid ids, unknown → throws, whitespace); every redirect key
   starts with `/`, no key is also a target; luchberg has 23 redirects.
   Expect: identical output, `_redirects` identical with the Cloudflare adapter
   (`DEPLOY_ADAPTER=cloudflare npm run build:local`).

2. **Multisite integration, luchberg routes move** 🔍
   Files: `src/multisite/integration.ts`, `src/multisite/routes.ts` (+ test),
   `git mv src/pages/* src/sites/luchberg/pages/` (relative imports get `../../` more),
   `astro.config.mjs` (`integrations: [multisite(SITE_ID), …]`), `vitest.config.ts` unchanged.
   Tests: `routePattern` for `index.astro`, `[slug].astro`, `hunde/[slug].astro`, `404.astro`,
   `tina-island/[name].ts`, `a/index.astro`, `[...rest].astro`, Windows separators.
   Expect: identical output (spike: 41/41 pages, sitemap identical); `npm run dev` shows the same
   site, `/admin` live editing still works on a dog page (manual check).

3. **Per-site public root files** 🔍
   Files: `src/multisite/integration.ts` (`astro:build:done` copy + dev middleware),
   `git mv public/{favicon.ico,icon-192.png,apple-touch-icon.png} src/sites/luchberg/public/`.
   Test: a small pure helper (`publicFilesFor(siteId)` / path mapping) if logic grows; otherwise
   covered by the dist diff.
   Expect: identical output; in dev `/favicon.ico` returns 200.

4. **Per-site Wrangler config**
   Files: `astro.config.mjs` (`configPath` for non-luchberg sites, read from the site definition),
   `src/sites/index.ts` (`wranglerConfig` field).
   Expect: luchberg unchanged; checked properly in step 9 once a second site exists.

5. **Shared detail-page factory and typename helper** 🔍
   Files: `src/lib/detailseite.ts` (factory + types moved), `src/lib/detailseiten.ts` (imports
   it), `src/layouts/Detailseite.astro` (type import), `src/lib/tina-typename.ts` (+ test).
   Tests: `blockName('PageBlocksHero') === 'Hero'`, `blockName('DackelPageBlocksText') === 'Text'`,
   `blockName('Unrelated')` falls back to the input.
   Expect: identical output.

6. **Generic `BaseHead` and `headMeta`** 🔍
   Files: `src/components/BaseHead.astro`, `src/layouts/Base.astro`, `src/lib/domain/seo.ts`
   (+ test: site default name is a parameter).
   Expect: identical output.

7. **`robots.txt` and `SITE_NOINDEX`**
   Files: `src/multisite/robots.txt.ts` (+ pure `robotsTxt({ site, noindex })` with test),
   `src/multisite/integration.ts` (injects it), `BaseHead.astro` (`noindex` meta), `.env.example`.
   Expect: output identical except the new `dist/client/robots.txt`.

8. **Tina multi-site groundwork** 🔒
   Files: `tina/sites/router.ts`; `tina/collections/*.ts` (labels "Rottweiler · …", routers
   wrapped in `siteRouter('luchberg', …)`); `tina/collections/fields.ts` (export shared config
   field groups); `src/sites/schema.test.ts` (imports the collection objects; add
   `tina/**/*.test.ts` to `vitest.config.ts` if the test lives there).
   Tests: collection names unique; paths unique and none is a prefix of another; every
   non-luchberg collection name starts with its site id and its path with `src/content/<id>/`;
   luchberg's five collections keep their names and paths (guards the "no move" decision).
   Expect: site output identical; admin shows the new labels; `tina-lock.json` changes only in
   labels.

9. **Site skeletons for `dackel` and `training`** 🔒
   Files per site: `tina/sites/<id>/{page,config}.ts` (`<id>Page` with a starter block set –
   `hero`, `text`, `cta`, `kontakt` from `tina/blocks` – and `<id>Config`), registration in
   `tina/config.ts`, `src/content/<id>/seiten/home.md`, `src/content/<id>/config/config.json`,
   `src/sites/<id>/{site.ts,wrangler.jsonc}`, `pages/{index.astro,[slug].astro,404.astro,
   tina-island/[name].ts}`, `layouts/Base.astro` (shared `BaseHead`, own header/footer islands),
   `lib/{data,detailseiten,islands}.ts`, `components/Blocks.astro` (dispatch via `blockName`),
   `styles/global.css` (token contract with neutral placeholder values, `source(none)` +
   `@source`), `public/` placeholder favicons, `public/uploads/<id>/.gitkeep`.
   Luchberg: `src/styles/global.css` gets `@source not` for the two site folders 🔍.
   Scripts: `dev:*`, `build:local:*`, `build:local:all`.
   Tests: extend `schema.test.ts`; a content test that new sites' image references stay in
   `/uploads/<id>/` (warn-level: `it.todo`/console warning, not a failure for luchberg folders).
   Expect: `npm run build:local:all` passes; dackel/training output contains only their pages,
   their sitemap and their favicons; `DEPLOY_ADAPTER=cloudflare SITE_ID=dackel npm run
   build:local` → `dist/server/wrangler.json` `name` is `vomluchberg-dackel`; `npx wrangler deploy
   --dry-run` passes per site (size only checked against 64 MiB uncompressed); `npm run dev:dackel` → `/admin` live-previews a dackel page
   and shows Rottweiler pages as forms only.
   The content models (dogs, litters, offers…) and real design are slices 1 and 2.

10. **Docs**
    Files: `CLAUDE.md` (multi-site section: `SITE_ID`, layout rule of thumb, schema-must-not-
    depend-on-site rule, sequential builds, lock regeneration, sibling-field rule across
    collections), `README.md` (dev per site, three workers + watch paths table), `HANDOFF.md`
    (state), `.env.example` (`SITE_ID`, `SITE_NOINDEX`).

11. **Optional cleanup (any time later, own commit):** move luchberg's site-specific components,
    layouts, `data.ts`/`detailseiten.ts`/`islands.ts`/`farbschema.ts` and `styles/global.css`
    into `src/sites/luchberg/`, leaving only shared modules in `src/components`/`src/lib`.
    Pure moves 🔍. Do it only when no other slice branch is open on those files.

12. **Infrastructure (manual, Toni; slice 3 owns domains)**
    Create workers `vomluchberg-dackel` and `vomluchberg-training` (Import repository, same repo),
    set build/deploy commands, variables and watch paths per the table in 2.7; check the
    name-mismatch behaviour on the first build; add the `*.workers.dev` URLs to the TinaCloud
    project's site URLs; save a document of each site in TinaCloud and check that only the
    matching worker(s) rebuild.

Suggested PR cut: steps 1–7 (no visible change to the live site except `robots.txt`) as PR A,
merged and deployed first; steps 8–10 as PR B (new sites appear, unpublished); step 12 after B.

## 5. Risks

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Schema accidentally depends on `SITE_ID` (e.g. someone filters collections) → TinaCloud build fails for some workers | medium | Rule in CLAUDE.md; `schema.test.ts` asserts the full collection list is registered regardless of env; only `ui` functions may read `SITE_ID`. |
| Karo previews the "wrong" site in an admin and thinks preview is broken | high | Prefixed labels, question to Karo, short note in the editing guide; each site's `/admin` linked from its own footer/impressum. |
| Workers Builds name check / auto-fix PR renames root `wrangler.jsonc` | low–medium | Verify on the first dackel build; don't merge such a PR; fallback to Wrangler environments (2.7). |
| `@tinacms/astro` island API is `experimental_` and may change | medium | Unchanged by this plan; per-site island route is 5 lines, easy to adapt. |
| Tailwind sources not restricted → luchberg CSS grows | low | `@source not` in step 9 + dist diff. |
| Parallel local builds fail (port 9000) | certain if done | `build:local:all` runs sequentially; documented. |
| Karo stores images in the wrong folder | medium | No pruning, so nothing breaks; tidy-up warning test for Toni. |
| Build queue on the free plan (1 concurrent build) | medium | Watch paths; shared-code changes are Toni's, not Karo's. |
| Luchberg regressions during the move | low | Dist diff on every 🔍 step; spike already showed identical output. |

## 6. Rollback

- Steps 1–7 are code-only and output-identical: `git revert` of the commit (or the PR A merge)
  restores the previous state; the luchberg worker's settings are never changed.
- Steps 8–9 add collections. Reverting them removes the collections from the schema; content
  under `src/content/{dackel,training}` can stay (Tina ignores files outside collections) or be
  removed. Regenerate the lock after a revert (`npm run dev`).
- Step 12: the two new workers can be disconnected or deleted without touching `vomluchberg`.
- Emergency fallback if multi-worker hosting were impossible: option (c) (one worker, path
  prefixes) is reachable from this layout by injecting each site's pages under a prefix – not
  planned, but no dead end.

## 7. Open questions for Toni

- **T1 – Worker names:** `vomluchberg-dackel` / `vomluchberg-training` (fits the Wrangler-env
  fallback, which requires the `vomluchberg-` prefix) or `alltag-kann-sport`? Names only show in
  `*.workers.dev` URLs until the domains exist. **Settled (R1): `vomluchberg-` prefix.**
- **T2 – Editing UX:** OK that live preview only works in each site's own `/admin`? Alternative
  would be a separate "editor" worker that serves all three sites under path prefixes purely for
  preview – more moving parts, not recommended now. *(Assumption: per-site `/admin`.)*
- **T3 – Windows:** does anyone run the scripts on Windows (cmd/PowerShell)? Then we add
  `cross-env`. *(Assumption: no.)*
- **T4 – TinaCloud plan:** three domains + `workers.dev` URLs in one project's site URLs – any
  plan limit? Please check in the dashboard during step 12.
- **T5 – Preview builds:** Workers Builds can build non-`main` branches as previews. Do we want
  that for the new sites (Tina branch detection works via `WORKERS_CI_BRANCH`)? **Settled (R3): yes**, as `03-betrieb.md` O4 plans: preview build command `npm run build:local`, `SITE_NOINDEX=true`.
- **T6 – Luchberg labels:** prefixing "Rottweiler · " changes what Karo sees in the sidebar from
  the first deploy of step 8. Announce it to her with the new sites, or hold step 8's label
  change back until the dachshund site goes live? *(Assumption: ship with PR B.)*

- **T7 – Collection names (new):** slice 0 planned `dackelPage`, slice 1 wrote `dackelSeite`. PR B
  uses `dackelPage` / `trainingPage` (mirrors luchberg's `page`; block typenames `DackelPageBlocks*`)
  and slice 1's plan was updated. Renaming later is cheap only while there is no content. OK?
  *(Assumption: yes.)*
- **T8 – Skeleton collections visible early (new):** after PR B is deployed, Karo sees "Dackel · …"
  and "Training · …" in `vomluchberg.de/admin` with placeholder content. Saving there only commits
  to `src/content/<id>/` (the two workers don't exist yet). The schema can't hide them (it must be the
  same for all sites). Tell Karo "please don't edit yet" when announcing the new labels, or hold PR B
  until slice 1 is ready? *(Assumption: deploy now, tell Karo; the question in `fragen-an-karo.md` §4
  was updated.)*
- **T9 – `TINA_PUBLIC_SITE_ID` relies on Tina CLI internals (new):** it works because the CLI loads
  `tina/config.ts` in Node before it builds the admin bundle with the `TINA_PUBLIC_*` env. If a Tina
  update changes that order, the dackel/training admins would lose their own live preview (forms still
  work). Belt and braces: also set `TINA_PUBLIC_SITE_ID=<id>` as a build variable on the two new
  workers? *(Assumption: not needed; re-check live preview after Tina updates.)*

## Spike results

Run on a throwaway branch in a scratch worktree (deleted, nothing committed).

| Spike | Result |
| --- | --- |
| Move the 7 luchberg route files to `src/sites/luchberg/pages/`, inject them with `injectRoute` | ✅ `build:local`: 41/41 HTML pages byte-identical to `main`, sitemap identical, Cloudflare `_redirects` identical, client file list identical. No `src/pages/` needed. |
| `import` of a `.ts` site definition from `astro.config.mjs` | ✅ works |
| Second site `dackel` (`dackelPage` reusing `tina/blocks`, `dackelConfig` as a second global collection) in the same schema | ✅ codegen + build OK; dackel build contains only `/`, `/ueber-uns/` and its sitemap; `__typename` = `DackelPageBlocksHero` |
| Same template name, different field type in two collections (`inhalt`: rich-text in `page`, string in `dackelPage`) | ✅ no codegen conflict – the sibling-field gotcha is per collection |
| Generated schema for `SITE_ID=luchberg` vs `dackel` with a site-aware `ui.router` | ✅ `_schema.json`, `_graphql.json`, `_lookup.json` byte-identical |
| `tina-lock.json` regeneration | `build:local` does not touch it; `tinacms dev` regenerates it (new collections appear) |
| On-demand island route via `injectRoute` (dev) | ✅ `POST /tina-island/dackelPage?slug=ueber-uns` renders; `/tina-island/page` → `Unknown island "page"` (registry is per site) |
| Tina router pointing to another origin | ❌ not supported (admin builds `#/~/<path>` on its own origin – `tinacms/dist/index.js`) |
| Cloudflare adapter `configPath` per site | ✅ `dist/server/wrangler.json` `name: vomluchberg-dackel`; `wrangler deploy` picks it up via `.wrangler/deploy/config.json` |
| Worker size (`wrangler deploy --dry-run`) | luchberg 4720 KiB / **998 KiB gzip**, dackel skeleton 4698 KiB / **995 KiB gzip** (limit at the time 3 MiB gzip; removed 2026-09-04) |
| Per-site `public/` copied into build root in `astro:build:done` | ✅ (dev serving still needs a middleware – step 3) |
| Pruning other sites' `uploads/<id>` in `astro:build:done` | ✅ works, but **not adopted** (2.4) |
| Two `build:local` in parallel | ❌ "Datalayer server is busy on port 9000" → builds run sequentially |
| `npm test` / `astro check` with the spike changes | 68 tests ✅, 0 errors / 0 warnings / 0 hints |
