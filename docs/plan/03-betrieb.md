# Slice 3 – Operations: domains, deployment, SEO, cross-links, Pfotentermin sunset

Status: **plan** (2026-11-05). Depends on slices 0 (multi-site mechanism), 1 (dachshund) and
2 (training). Everything here builds on the working assumptions D1–D10 in [`README.md`](README.md).
Open questions for Karo: section "Betrieb & Domains" in [`fragen-an-karo.md`](fragen-an-karo.md).
Karo-readable domain checklist (German): [`../domains-neue-seiten.md`](../domains-neue-seiten.md).

Legend for owners: **T** = Toni, **K** = Karo, **C** = Claude (code/docs in this repo).

---

## 0. Facts checked for this plan (2026-11-05)

| Topic | Finding | Source |
| --- | --- | --- |
| Worker size limit | The compressed 3 MB (free) / 10 MB (paid) limit was **removed on 2026-09-04**. Only the uncompressed bundle counts: **64 MiB on all plans**. The comment in `astro.config.mjs` is outdated; `stubServerHighlighters()` stays (smaller bundle = faster cold start, 1 s startup limit) but is no longer a hard requirement. | developers.cloudflare.com/changelog/post/2026-09-04-increased-worker-size-limit |
| Static assets | Free plan: 20,000 files per Worker version, 25 MiB per file. | developers.cloudflare.com/workers/platform/limits |
| Monorepo | One repo can be connected to several Workers. Each Worker has its own root directory, build command, deploy command, build variables and **build watch paths** (include/exclude). | …/workers/ci-cd/builds/advanced-setups |
| Worker name | Workers Builds overrides the `name` in the Wrangler file with the dashboard Worker's name (`WRANGLER_CI_OVERRIDE_NAME`, Wrangler ≥ 3). One `wrangler.jsonc` would technically serve all three Workers. | …/workers/ci-cd/builds/troubleshoot |
| Build vs runtime vars | Build variables are only visible during the build, not at runtime. | …/workers/ci-cd/builds/configuration |
| Default build vars | `CI`, `WORKERS_CI=1`, `WORKERS_CI_BRANCH`, `WORKERS_CI_COMMIT_SHA`, `WORKERS_CI_BUILD_UUID`. | same |
| Previews | Since 2026-09-22 non-production branches use **Worker Previews** (`npx wrangler preview`, needs `"previews": {}` and `"preview_urls": true` in the Wrangler file). Previews have their own build settings (`previews_base_config`, incl. build command and build vars) and do **not** inherit production settings. Workers connected to Builds earlier keep the legacy model until a one-time, irreversible switch in the dashboard. | …/workers/ci-cd/builds/build-branches, …/workers/previews/configuration |
| Custom domains | A Custom Domain matches one exact hostname. For `www` ↔ apex use a Redirect Rule plus a proxied placeholder record (`AAAA 100::`) for the hostname that only redirects. | …/workers/configuration/routing/custom-domains |
| Domain availability | DENIC RDAP (`rdap.denic.de`) returned **404 = not registered** for: `alltag-kann-sport.de`, `alltagkannsport.de`, `rauhaardackel-vom-luchberg.de`, `rauhaardackelvomluchberg.de`, `dackel-vom-luchberg.de`, `teckel-vom-luchberg.de`, `luchberg-dackel.de`, `rauhaardackel-luchberg.de`, `karolin-riesing.de`, `hundetraining-riesing.de`, `hundetraining-karolin-riesing.de`. Verisign RDAP: `alltag-kann-sport.com` and `alltagkannsport.com` not registered. (Control: `vomluchberg.de` → 200.) Re-check right before ordering. | RDAP queries from this session |

**Not verified:** the Pfotentermin code. `add_repo` for `tonimoeckel/pfotentermin` was refused in this
session, so section 6 is planned against the file names from the brief and lists what Toni has to check
in each file (task P-01). Nothing in Pfotentermin was read or changed.

---

## 1. Decisions

| # | Decision | Why |
| --- | --- | --- |
| O1 | **Three Workers, one repo, root directory `/`**: `vomluchberg` (exists), `vomluchberg-dackel`, `alltag-kann-sport`. Same build command `npm run build`; the site is chosen by the build variable `SITE_ID`. | D1/D3. Same command keeps the dashboards boring; the only differences are env vars and watch paths. |
| O2 | **One Wrangler file per site** (`wrangler.jsonc` for luchberg stays as is, plus `wrangler.dackel.jsonc`, `wrangler.training.jsonc`), deploy command `npx wrangler deploy --config <file>`. | The name override would work with one file, but explicit files make local `wrangler deploy` and `wrangler preview` safe (no accidental deploy of the dachshund build onto the Rottweiler Worker). |
| O3 | **Build watch paths per Worker**, written as *exclude other sites' content*. Shared code (components, `src/lib`, `tina/`, `package*.json`, `astro.config.mjs`) rebuilds all three. | A Tina save for one site must only rebuild that site (≈1–2 min each; avoids three parallel builds on every save). |
| O4 | **Preview builds on**, with preview build command `npm run build:local` and `noindex`. | Previews must not need the branch to be indexed in TinaCloud, and must never be indexed by Google. `/admin` on a preview is local-mode only, which is fine for reviewing layout. |
| O5 | **Canonical host = `www.` for all three domains**, apex 301 → www (same as `vomluchberg.de` in `domain-umzug.md`). | One rule for Toni and Karo; consistent printed URLs ("www.…" also reads as a web address on flyers). |
| O6 | **Domains (working assumption):** `rauhaardackel-vom-luchberg.de` and `alltag-kann-sport.de`. Registrant Karo, registrar **INWX** (same account as `vomluchberg.de`), DNS on Cloudflare (free plan, same Cloudflare account as the Workers). | Both free as of 2026-11-05, match the working names, .de preferred. Keeping registrar + DNS identical to `vomluchberg.de` means one process for all three. |
| O7 | **No new mailboxes.** Contact stays on the Gmail addresses. Optional: Cloudflare Email Routing for a nice receive-only address (e.g. `hallo@alltag-kann-sport.de` → Gmail). Domains without mail get anti-spoofing records (null MX, `v=spf1 -all`, DMARC `p=reject`). | Karo already uses Gmail; nothing to migrate. |
| O8 | **One TinaCloud project**, all saves commit to `main`. No Tina editorial workflow. | D2. Rebuild routing is done by the watch paths (O3), not by Tina. |
| O9 | **Cross-link URLs come from a site registry in code**, only rendered for sites flagged `live`. The hint text is editable in each site's Tina "Einstellungen". | A link must never point to a `*.workers.dev` URL; switching a domain is one code change, not three content edits. |
| O10 | **Pfotentermin: redirect first, deactivate later, delete never (without export).** 301 from all tenant URLs to `www.alltag-kann-sport.de` the day the training site is live; tenant switched to inactive after ≥ 4 weeks without issues; data exported to Karo first. Redirect stays ≥ 12 months. | D9. No gap for customers or Google; reversible until the tenant is deactivated. |

---

## 2. Interfaces needed from the other slices

### From slice 0 (multi-site mechanism)

| ID | Requirement | Why |
| --- | --- | --- |
| I-1 | `SITE_ID` is read **at build time** (`process.env.SITE_ID` in `astro.config.mjs` / `import.meta.env` inlined). Missing → `luchberg` (keeps the existing Worker working unchanged). Unknown value → build fails. | Build vars are not available at runtime; the `/tina-island` route must not depend on runtime env. |
| I-2 | `SITE_URL` keeps its meaning (canonical, sitemap, OG). Same fallback chain as today in `getSiteUrl()`. | Already used by `BaseHead.astro` and `@astrojs/sitemap`. |
| I-3 | A **site registry** (e.g. `src/sites/index.ts`) with per site: `id`, `name`, `productionUrl`, `live: boolean`, owned content folders and upload folders. Pure module, unit-tested. | Source for cross-links (O9), JSON-LD, and the watch-path list (I-6). |
| I-4 | A switch `SITE_NOINDEX=true` (build var) and automatic noindex when `WORKERS_CI_BRANCH` is set and ≠ `main`: `<meta name="robots" content="noindex,nofollow">` on every page and `robots.txt` with `Disallow: /`. | New sites run on `*.workers.dev` before their domain exists; previews must never be indexed. |
| I-5 | Per-site `robots.txt` endpoint (today there is none) with `Sitemap: ${SITE_URL}/sitemap-index.xml`, `Disallow: /admin/` and `/tina-island/`. `@astrojs/sitemap` filters out `/admin`, `/tina-island`, `/404`. | Per-domain sitemaps for Search Console. |
| I-6 | Each build ships **only its own uploads** (`public/uploads/<own folders>`) plus shared files (favicons per site). Plus a test that fails when a site's content references `/uploads/…` outside its own folders. Optional: `npm run watch-paths` prints the include/exclude list per Worker from the registry. | Otherwise all three domains serve every image, and an image Karo uploads into the wrong folder silently goes missing. |
| I-7 | Per-site Wrangler files (O2) with `"previews": {}` and `"preview_urls": true`; same `compatibility_date`/`nodejs_compat` as today. | Worker Previews (section 0). |
| I-8 | Redirects per site (the old-site `redirects` in `astro.config.mjs` stay luchberg-only). Training site gets a small redirect list for old Pfotentermin paths only if the training site re-uses them (it doesn't need to: Pfotentermin redirects are done on the Pfotentermin side, section 6). | Keep the 301s from the old Rottweiler site intact. |
| I-9 | Decision on **where `/admin` lives** and how visual editing previews dachshund/training documents (one admin on `vomluchberg.de` with absolute preview URLs, or `/admin` built into every site). Whatever it is, slice 3 needs the list of origins to add to TinaCloud (task T-03). | TinaCloud only accepts logins/previews from configured site URLs. |

### From slice 1 (dachshund) and slice 2 (training)

- Final route list per site (for redirect mapping, sitemap check and the Pfotentermin path map in 6.3).
- Which Tina "Einstellungen" field holds the cross-link text (O9) and the contact data used for JSON-LD.
- Slice 2: URL of the offers page and the inquiry form anchor (`/kontakt` or `/#anfrage`) – target of the Pfotentermin booking-page redirects.
- Slice 1: what happens with `src/content/hunde/rauhaardackel.md` and `public/uploads/rudel/dackel/` (copy vs. move, see 4.4).

---

## 3. Cloudflare setup

### 3.1 Worker matrix

| | `vomluchberg` | `vomluchberg-dackel` | `alltag-kann-sport` |
| --- | --- | --- | --- |
| Status | exists (Rottweiler) | new | new |
| Git | `tonimoeckel/vomluchberg`, production branch `main` | same | same |
| Root directory | `/` | `/` | `/` |
| Build command | `npm run build` | `npm run build` | `npm run build` |
| Deploy command | `npx wrangler deploy` | `npx wrangler deploy --config wrangler.dackel.jsonc` | `npx wrangler deploy --config wrangler.training.jsonc` |
| Preview build command | `npm run build:local` | `npm run build:local` | `npm run build:local` |
| Preview command | `npx wrangler preview` | `npx wrangler preview --config wrangler.dackel.jsonc` | `npx wrangler preview --config wrangler.training.jsonc` |
| Custom domain (later) | `www.vomluchberg.de` | `www.rauhaardackel-vom-luchberg.de` | `www.alltag-kann-sport.de` |

### 3.2 Build variables (production)

All values are **build** variables (Settings → Build → Variables and secrets). Nothing is needed at runtime
as long as I-1 holds. Mark `TINA_TOKEN` and `PUBLIC_WEB3FORMS_KEY` as secret (masked in logs).

| Variable | `vomluchberg` | `vomluchberg-dackel` | `alltag-kann-sport` |
| --- | --- | --- | --- |
| `SITE_ID` | `luchberg` | `dackel` | `training` |
| `SITE_URL` | `https://www.vomluchberg.de` | before go-live: its `*.workers.dev` URL; after: `https://www.rauhaardackel-vom-luchberg.de` | before: `*.workers.dev`; after: `https://www.alltag-kann-sport.de` |
| `SITE_NOINDEX` | – | `true` until go-live, then delete | `true` until go-live, then delete |
| `PUBLIC_TINA_CLIENT_ID` | project client ID | **same** | **same** |
| `TINA_TOKEN` | read-only token | **same** | **same** |
| `PUBLIC_WEB3FORMS_KEY` | key "Rottweiler" | key "Dackel" | key "Training" |
| `PUBLIC_FARBVORSCHAU` | `false` | optional `true` during design review | optional `true` during design review |
| `NODE_VERSION` | `22` (only if the build image default is older than `engines.node >=22.22`; alternatively commit `.nvmrc`) | same | same |

Preview builds (Previews Base config): same variables, but `SITE_NOINDEX=true` and **no** `TINA_TOKEN`
needed (preview build command is `build:local`). Keep `PUBLIC_WEB3FORMS_KEY` empty on previews so test
submissions fall back to `mailto:` and never reach Karo's inbox.

Web3Forms: one key per site, all created with Karo's (training: the training) e-mail address, named after
the site, so Karo sees in the e-mail which site an inquiry came from. Check the current free-plan limits
on web3forms.com when creating the keys.

### 3.3 Build watch paths

Rule of thumb: everything triggers all three, **except** content and uploads that belong to another site.
Patterns follow the dashboard's wildcard syntax (`*` matches across `/` in the Workers Builds UI – check
the hint text in the dashboard when entering them; adjust to `**` if the UI asks for it).

| Worker | Include | Exclude |
| --- | --- | --- |
| `vomluchberg` | `*` | `src/content/dackel/*`, `src/content/training/*`, `public/uploads/dackel/*`, `public/uploads/training/*`, `docs/*`, `migration/*`, `*.md` in repo root |
| `vomluchberg-dackel` | `*` | `src/content/seiten/*`, `src/content/hunde/*`, `src/content/wuerfe/*`, `src/content/aktuelles/*`, `src/content/config/*`, `src/content/training/*`, `public/uploads/galerie/*`, `public/uploads/header/*`, `public/uploads/hunde/*`, `public/uploads/news/*`, `public/uploads/rudel/*`, `public/uploads/seiten/*`, `public/uploads/wuerfe/*`, `public/uploads/training/*`, `docs/*`, `migration/*` |
| `alltag-kann-sport` | `*` | same luchberg folders as above, plus `src/content/dackel/*`, `public/uploads/dackel/*`, `docs/*`, `migration/*` |

Notes:

- The long luchberg list exists because D4 keeps the Rottweiler content in the old folders. If slice 0
  moves it to `src/content/luchberg/` + `public/uploads/luchberg/`, the lists shrink to two lines each.
  Either way, generate them from the registry (I-6) and paste them; don't hand-maintain.
- Exception to watch for: if slice 1 keeps using images from `public/uploads/rudel/dackel/` (Rottweiler
  folder), then dackel must **not** exclude that folder. Preferred: copy them to `public/uploads/dackel/`.
- `tina/tina-lock.json` and `tina/**` changes rebuild all three – correct, the schema is shared.
- If a dashboard build is skipped by watch paths, no GitHub check run appears for that Worker. That is
  expected, not a failure.

### 3.4 Tasks

| ID | Owner | Task | Done when |
| --- | --- | --- | --- |
| CF-01 | C | (after slice 0) Add `wrangler.dackel.jsonc` and `wrangler.training.jsonc` (names `vomluchberg-dackel` / `alltag-kann-sport`), add `previews`/`preview_urls` to all three. Update the outdated 3 MiB comment in `astro.config.mjs`. | `npm run build:local` with each `SITE_ID`, `npx wrangler deploy --dry-run --config …` passes for all three. |
| CF-02 | T | `vomluchberg` Worker: Settings → Builds → switch to **Worker Previews** (one-time, irreversible), set preview build command `npm run build:local`, preview vars (3.2), watch paths (3.3). | A push to a feature branch creates a Preview URL with `noindex`; a push to `docs/` only does not build. |
| CF-03 | T | Create Worker `vomluchberg-dackel`: *Workers & Pages → Create → Import repository* `vomluchberg`, settings from 3.1/3.2/3.3, `SITE_NOINDEX=true`, `SITE_URL=<workers.dev URL>`. | Site reachable on `vomluchberg-dackel.<subdomain>.workers.dev`, page source contains `noindex`. |
| CF-04 | T | Same for `alltag-kann-sport`. | as above |
| CF-05 | T | Create the three Web3Forms keys (with Karo's e-mails) and set them. Test each form once on production. | Karo confirms three test mails arrived. |
| CF-06 | T | Workers & Pages → each Worker → Settings → Domains & Routes: after go-live (section 7), **disable the `workers.dev` route for production** (keep Preview URLs on). | `*.workers.dev` of the production Worker returns 404/disabled; previews still work. |
| CF-07 | T+C | Smoke test after setup: save a dachshund text in Tina → only `vomluchberg-dackel` builds; save a Rottweiler text → only `vomluchberg` builds; change a shared component → all three build. | Build history shows exactly that. |

---

## 4. TinaCloud

### 4.1 Flow

Karo saves in `/admin` → TinaCloud commits to `main` of `tonimoeckel/vomluchberg` → GitHub push event →
each of the three Workers Builds evaluates its watch paths → only the affected Worker builds and deploys
(≈1–2 min). Uploads in the media manager are commits to `public/uploads/…` and follow the same routing.

### 4.2 Branch detection (`tina/config.ts`)

The existing chain (`GITHUB_BRANCH` → `WORKERS_CI_BRANCH` → `CF_PAGES_BRANCH` → `HEAD` → `main`) already
works for all three Workers because Workers Builds injects `WORKERS_CI_BRANCH`. No change needed.
Production builds always run on `main`. Preview builds use `build:local` (O4), so a feature branch that is
not indexed in TinaCloud cannot break a preview build.

### 4.3 Media root

Keep **one** media root `public/uploads` (Tina supports only one per project) and use **per-site
subfolders** `uploads/dackel/…`, `uploads/training/…` (D4); Rottweiler stays in its existing folders.
Protection against wrong folders: per-field `uploadDir` on image fields if the installed TinaCMS version
supports it (check in slice 0), plus the content test from I-6. Karo-facing tip in the editor field
descriptions: "Bilder für die Dackel-Seite bitte im Ordner *dackel* ablegen".

### 4.4 Tasks

| ID | Owner | Task |
| --- | --- | --- |
| T-01 | T | Confirm the TinaCloud plan still covers one project + Karo + Toni (tina.io/pricing). No new project needed. |
| T-02 | T | TinaCloud → project → Configuration: confirm the repo and that `main` is the production branch. |
| T-03 | T | TinaCloud → Site URLs: add every origin that serves `/admin` (from I-9): the three `*.workers.dev` URLs now, the three `www.` domains at go-live, `http://localhost:4321`. |
| T-04 | C | After slice 0: verify `/admin` login + save on each Worker that serves an admin, and that the save triggers exactly one Worker (CF-07). |

---

## 5. SEO and cross-links

### 5.1 Per site

| Item | Rule |
| --- | --- |
| Canonical | `new URL(pathname, SITE_URL)` as today in `BaseHead.astro`; `SITE_URL` always the `www.` production URL (also on previews – combined with `noindex`). |
| `og:url`, `og:image` | from `SITE_URL` (already implemented). Each site needs its own `teilenBild` and favicons. |
| Sitemap | `@astrojs/sitemap` per build → `https://www.<domain>/sitemap-index.xml`. Exclude `/admin`, `/tina-island`, `/404`, and (luchberg) redirect sources. |
| `robots.txt` | per site (I-5); `Disallow: /` while `SITE_NOINDEX`/preview. |
| `<html lang="de">` | all sites. |
| Search Console | one **Domain property** per domain, verified by DNS TXT in Cloudflare (Cloudflare can add it automatically from the Search Console wizard). Submit the sitemap. Add Karo as owner/full user if she has a Google account. |

### 5.2 Structured data (JSON-LD in `BaseHead`, generated from the registry + Tina config)

- **All sites:** `WebSite` (name, url) and a shared `Person` "Karolin Riesing" with a stable `@id`
  (`https://www.vomluchberg.de/#karolin-riesing`) and `sameAs` = the other live sites + social profiles.
- **Rottweiler + dachshund:** `Organization` (kennel name, logo, address, telephone, email, `founder` →
  Person, `memberOf` ADRK for the Rottweiler site only). No `LocalBusiness`/`Product`/`Offer` for puppies
  (no prices, avoids looking like a pet shop).
- **Training:** `LocalBusiness` (name "Alltag kann Sport – Hundetraining Karolin Riesing", address,
  telephone, email, url, `areaServed` e.g. Glashütte/Dippoldiswalde/Dresden region – ask Karo, `founder`
  → Person, `priceRange` only if prices are shown) and a `Service`/`Offer` per offer (name, description,
  price + `priceCurrency: EUR` only if shown). **No `aggregateRating`/reviews** unless they are real,
  shown on the page and collected by Karo herself.
- Validate with the Rich Results Test before each go-live.

### 5.3 Cross-link placement (D7)

Only rendered for target sites with `live: true` in the registry (O9). Plain `<a>` (no `nofollow`;
same owner, relevant to visitors). Text editable in each site's Tina "Einstellungen" (field from slice
1/2), defaults below.

| On site | Where | Default text | Target |
| --- | --- | --- | --- |
| Rottweiler | Footer, left column under the ADRK line (small, `text-sm`) | "Wir züchten auch Rauhaardackel → rauhaardackel-vom-luchberg.de" | dachshund home |
| Rottweiler | Footer, same block (if Karo agrees, question "Querverweise" in "Allgemein") | "Hundetraining bei Karo: Alltag kann Sport →" | training home |
| Rottweiler | `/hunde/rauhaardackel` | short teaser card (see 5.4) | dachshund home |
| Dachshund | Footer, one line | "Unsere Rottweiler findet ihr auf vomluchberg.de →" (+ training line) | Rottweiler home |
| Training | Footer, one line | "Karos Zucht: Rottweiler vom Luchberg · Rauhaardackel vom Luchberg" | both homes |

No shared navigation, no cross-site header links, no cards on the home pages.

### 5.4 Avoiding duplicate content (`/hunde/rauhaardackel`)

Today the Rottweiler site has a full dachshund profile (`src/content/hunde/rauhaardackel.md`, long text +
13 photos). When the dachshund site goes live:

1. **At go-live (default):** shorten the luchberg profile to a teaser: 2–3 own sentences ("Zu unserem
   Rudel gehören auch Hanni und Bonnie …"), max. 2 photos, the cross-link card. The long breeding text
   moves (rewritten by slice 1) to the dachshund site only. Karo's edit, Toni/Claude prepare a draft.
2. **Later (optional):** if Karo prefers, 301 `/hunde/rauhaardackel` → `https://www.rauhaardackel-vom-luchberg.de/`
   (and update the old-site redirect `/weitere-rudelmitglieder/rauhaardackel` to point there directly, to
   avoid a chain), and remove the entry from the Rottweiler dog list.
3. Photos: copy (not move) the ones the dachshund site uses into `public/uploads/dackel/`. Shared images on
   two domains are not a duplicate-content problem; duplicate texts are.

The training site has no overlap with the breeding sites. The Pfotentermin texts disappear behind 301s
(section 6), so the new training site does not compete with its old copy.

### 5.5 Tasks

| ID | Owner | Task |
| --- | --- | --- |
| S-01 | C | Implement I-4/I-5 (if slice 0 doesn't) + tests: robots/noindex per env, sitemap filter. |
| S-02 | C | JSON-LD builder as a pure module in `src/lib/domain/seo.ts` (+ tests), wired in `BaseHead.astro`. |
| S-03 | C | Footer cross-link component reading the registry + Tina text; teaser card for `/hunde/rauhaardackel`. |
| S-04 | K (+C draft) | Shorten the luchberg dachshund profile at dachshund go-live (5.4). |
| S-05 | T | Search Console domain property + sitemap for each new domain at go-live; check "Seiten"/"Indexierung" after 1 and 4 weeks. |

---

## 6. Pfotentermin sunset (D9)

**Constraint:** no changes in `tonimoeckel/pfotentermin` during planning. The code could not be read in
this session (access refused), so every step below that depends on Pfotentermin internals starts with a
verification task.

### 6.1 What to check first (P-01, Toni, ~30 min)

| File | Question |
| --- | --- |
| `proxy.ts` | How are tenant hosts (`<alias>.pfotentermin.eu`) and path tenants (`/s/<alias>`) resolved? Is there already an early-return hook where a per-tenant redirect could live? What happens for an inactive/unknown tenant (404, landing page)? |
| `lib/utils/tenantUrl.ts` | Which URL variants exist for a tenant (subdomain, `/s/<alias>`, custom domain)? → list of hosts/paths that must redirect. |
| `app/admin/tenants/[alias]/settings/domain/page.tsx` | Does Pfotentermin support a custom domain per tenant? Was one ever configured for `karolin-riesing` (then that domain must redirect too)? Is there a "redirect"/"external website" field already? |
| `next.config.js` | Existing `redirects()`/`headers()`; is `redirects()` host-aware (`has: [{ type: 'host' }]`)? |
| `prisma/schema.prisma` | Tenant flags: `active`/`disabled`/`published`/`deletedAt`, booking toggles, any `redirectUrl`/`website` field. Which models hang off the tenant (customers, dogs, leads/inquiries, reservations/bookings, courses, invoices)? Cascading deletes on the tenant relation (risk!)? |
| DNS of `pfotentermin.eu` | Is the zone on Cloudflare and are the tenant hostnames **proxied** (orange cloud)? Decides option A below. |

### 6.2 Redirect options (choose after P-01)

| Option | How | Pros | Cons |
| --- | --- | --- | --- |
| **A – Cloudflare Single Redirect (preferred if `pfotentermin.eu` is proxied by Cloudflare)** | Rule 1: `http.host eq "karolin-riesing.pfotentermin.eu"` → dynamic 301 to `https://www.alltag-kann-sport.de` + mapped path. Rule 2: any pfotentermin host with `starts_with(http.request.uri.path, "/s/karolin-riesing")` → same. Preserve query string off. | No Pfotentermin deploy, instant on/off (rollback = disable rule), lives outside the app. | Only works if traffic goes through Cloudflare; path mapping limited to a few rules. |
| **B – Hard-coded in `next.config.js` `redirects()`** | `{ source: '/s/karolin-riesing/:path*', destination: 'https://www.alltag-kann-sport.de/…', permanent: true }` plus a host-matched rule for the subdomain. | Simple, versioned. | Needs a Pfotentermin deploy; rollback = another deploy. Does not apply if `proxy.ts` rewrites before Next's redirects run – check order. |
| **C – Generic tenant field (nice long-term)** | New nullable `Tenant.redirectUrl` (+ admin field on the domain settings page); `proxy.ts` returns a 301 to `redirectUrl + mappedPath` for every URL variant of that tenant **before** the active/inactive check. | Reusable for any leaving tenant; Toni can toggle it in the admin UI. | Prisma migration + UI + deploy; most effort. |

Recommendation: **A** if possible (zero code); otherwise **C** if Toni wants the feature in Pfotentermin
anyway, else **B**. In all cases the redirect must win over "tenant inactive" (6.4), otherwise
deactivation turns the redirect into a 404.

### 6.3 Path mapping

Fill in once slice 2's routes and Pfotentermin's real tenant routes (P-01) are known. Default for
anything unmapped: the new home page (not a 404).

| Old (Pfotentermin) | New |
| --- | --- |
| `karolin-riesing.pfotentermin.eu/` and `/s/karolin-riesing` | `https://www.alltag-kann-sport.de/` |
| tenant offer/course list pages | offers page (slice 2) |
| single offer/course pages | offers page (or matching offer page if slice 2 has one per offer) |
| booking / reservation / inquiry pages | inquiry form (slice 2), e.g. `/kontakt` |
| about / team pages | about page (slice 2) |
| imprint / privacy of the tenant | `/impressum`, `/datenschutz` |
| everything else under the tenant | `/` |

Use 301 (permanent). Keep the redirect for **at least 12 months**, ideally permanently (it costs nothing).

### 6.4 Data and deactivation

1. **P-02 (T) Inventory** – count per model for the tenant: customers, dogs, leads/inquiries, open
   reservations/bookings, upcoming appointments, unpaid items.
2. **P-03 (T) Export** – export the tenant's data (CSV/JSON per model, or a `pg_dump` filtered to the
   tenant) and hand it to Karo **securely** (not as an e-mail attachment; e.g. encrypted ZIP + password by
   phone). Keep one encrypted copy for Toni until the retention decision. Karo is the controller of her
   customers' data; Pfotentermin/Toni processed it on her behalf (GDPR Art. 28 – check whether an AV
   agreement exists).
3. **P-04 (K) Open cases** – before the redirect goes live, Karo personally contacts everyone with an
   open reservation/inquiry/appointment: training continues as agreed, new contact = phone/e-mail/inquiry
   form on the new site. Optional: one short e-mail to all active customers announcing the new address
   (only to people she has a customer relationship with; no newsletter list).
4. **P-05 (T) Freeze** – the day of the redirect, switch off online booking/inquiry for the tenant (flag
   from P-01), so nothing new can arrive in Pfotentermin. The redirect makes the public pages unreachable
   anyway; this also covers API/direct links.
5. **P-06 (T) Deactivate** – after ≥ 4 weeks without problems, set the tenant inactive (soft flag, **no
   delete**). Karo's admin login stays usable read-only for ~3 months (assumption, question for Karo).
6. **P-07 (T+K) Retention/deletion** – after the transition: delete or anonymise the tenant data in
   Pfotentermin unless there are retention duties (invoices: 8–10 years under German tax law – if
   Pfotentermin generated invoices, they must be kept by Karo, so they belong in the export). Check the
   tenant relation for cascade deletes before deleting anything. Document the date.
7. **Search Console** – optional: if Toni has `pfotentermin.eu` in Search Console, verify the
   `karolin-riesing.pfotentermin.eu` property and try the Change of Address tool to the new domain; if the
   tool doesn't accept it, the 301s are enough. Remove the tenant URLs from Pfotentermin's own sitemap.
8. **Outside links (K)** – Google Business Profile, Facebook/Instagram bio, flyers, business cards,
   e-mail signature, dog club listings: switch to `www.alltag-kann-sport.de`.

---

## 7. Go-live runbook

Order: **0 → 1 → 2 → 3** as in the README; the dachshund site can go live before the training site.
Each step lists its rollback. "Live check" = home, two subpages, 404, form, `robots.txt`,
`sitemap-index.xml`, canonical in source, mobile view.

### Phase A – Foundation (once)

| # | Owner | Step | Rollback |
| --- | --- | --- | --- |
| A1 | C | Slice 0 merged; `vomluchberg` production build unchanged (diff of `dist/` HTML for luchberg before/after is empty except intended changes). | Revert the merge commit; the Worker redeploys the previous build. Or Cloudflare → Deployments → roll back to the previous version (instant). |
| A2 | T | CF-02 (previews + watch paths on `vomluchberg`). | Watch paths: clear the fields. Previews switch can't be undone, but it only affects non-`main` branches. |
| A3 | T | CF-03/CF-04: new Workers on `workers.dev`, `noindex`. T-03 for the workers.dev origins. | Delete the Worker (nothing public depends on it). |
| A4 | K | Domains ordered at INWX (checklist [`domains-neue-seiten.md`](../domains-neue-seiten.md), part 1). Can happen any time; the domains can sit unused. | Not needed (a registered unused domain costs a few euros/year). |
| A5 | T | Zones added to Cloudflare, nameservers switched at INWX, anti-spoofing mail records (O7). | Switch nameservers back to INWX defaults. |

### Phase B – Dachshund site go-live

| # | Owner | Step | Rollback |
| --- | --- | --- | --- |
| B1 | K+T | Content and design approved on the workers.dev URL. | – |
| B2 | T | Worker `vomluchberg-dackel` → Domains & Routes → Custom Domain `www.rauhaardackel-vom-luchberg.de`; apex: proxied `AAAA 100::` + Redirect Rule apex → www (301, keep path + query). | Remove the Custom Domain and the rule; domain shows nothing (not yet linked anywhere). |
| B3 | T | Build vars: `SITE_URL=https://www.rauhaardackel-vom-luchberg.de`, delete `SITE_NOINDEX`; redeploy. T-03 for the new origin. | Set `SITE_NOINDEX=true` again, redeploy (≈2 min). |
| B4 | T | Live check + form test (CF-05) + Rich Results Test. | as B3 |
| B5 | C | Registry: `dackel.live = true` → cross-links on Rottweiler (and training, if live) appear; luchberg profile shortened (S-04). One commit, so it can be reverted alone. | Revert that commit. |
| B6 | T | Search Console property + sitemap (S-05). CF-06 for the dachshund Worker. | Re-enable the workers.dev route. |

### Phase C – Training site go-live (requires P-01…P-04 done)

| # | Owner | Step | Rollback |
| --- | --- | --- | --- |
| C1 | K+T | Content approved; Impressum/Datenschutz final (section 8); inquiry form tested end to end. | – |
| C2 | T | Custom Domain `www.alltag-kann-sport.de` + apex redirect (as B2). | as B2 |
| C3 | T | `SITE_URL` set, `SITE_NOINDEX` removed, redeploy; live check; T-03. | as B3 |
| C4 | C | Registry `training.live = true` → cross-links. | Revert commit. |
| C5 | T | **Pfotentermin redirect on** (6.2 option chosen) + freeze bookings (P-05). Test every row of 6.3 with `curl -sI` (expect `301` + correct `location`, no chains). | Option A: disable the rule (instant). B/C: revert/unset and redeploy Pfotentermin. Bookings can be re-enabled. |
| C6 | T | Search Console for the new domain (+ optional Change of Address, 6.4.7). CF-06. | – |
| C7 | K | Update outside links (6.4.8). | – |
| C8 | T | After ≥ 4 weeks: P-06 deactivate tenant. After the agreed period: P-07. | Until P-07: re-activate the tenant flag. After P-07: only from the export. |

### Phase D – Follow-up (both sites)

- Week 1 and week 4: Search Console coverage, 404s, Cloudflare Worker errors.
- Week 4: decide on 5.4 option 2 (301 of `/hunde/rauhaardackel`).
- Update `README.md` (deployment section: three Workers, env matrix link) and `CLAUDE.md` (commands per
  site) – task for the slice 0/3 implementation session.

---

## 8. Legal pages per site (needs human/legal check)

Not legal advice – this lists what each page has to cover so a generator (e.g. eRecht24, Dr. Schwenke)
can be filled in correctly; Karo confirms the final text. All three sites belong to the same person, but
each domain needs **its own reachable Impressum and Datenschutzerklärung** (one click from every page,
already in the footer).

| Topic | Rottweiler | Dachshund | Training | Check |
| --- | --- | --- | --- | --- |
| Impressum basis | § 5 DDG (replaced TMG in 2024) | same | same | generator |
| Name, address, phone, e-mail | Karo | Karo | Karo (training e-mail) | Karo |
| Permit under § 11 TierSchG + competent authority | if breeding is "gewerbsmäßig" | if gewerbsmäßig | **dog training for others usually needs the § 11 Abs. 1 Nr. 8 f permit** – then the authority (Veterinäramt) belongs in the Impressum | **legal + Karo** |
| VAT ID / small business | if any | if any | if any (training is a paid service) | Karo / tax advisor |
| Club membership | ADRK, Zwingernummer (already in footer) | club if any (question in dachshund section) | – | Karo |
| Consumer dispute resolution (VSBG) statement | only if required | only if required | likely relevant (services to consumers) | generator; the EU ODR platform link is obsolete since 2025 – don't copy old templates blindly |
| Datenschutz: hosting | Cloudflare (server logs, US provider, EU-US DPF) | same | same | generator |
| Datenschutz: contact form | Web3Forms (processor, where data is stored) + `mailto:` fallback | same | same + content of inquiries (dog/health info) | generator, check Web3Forms DPA |
| Datenschutz: e-mail | Gmail (Google) as mailbox | same | same; plus Cloudflare Email Routing if used | generator |
| Datenschutz: fonts / cookies / tracking | self-hosted, none, none | same | same | – |
| Datenschutz: social links | plain links only (no embeds) | same | same | – |
| Editor (`/admin`, TinaCloud) | only editors, not visitors – mention briefly or not at all | same | same | generator |
| Contract terms | – | – | **if Karo concludes paid training contracts with consumers by e-mail/phone/form, distance-selling rules (Widerrufsbelehrung) may apply** even without AGB | **legal** |
| Old Pfotentermin data | – | – | Datenschutz of the new site doesn't cover Pfotentermin; the tenant's old privacy policy stays valid for data collected there until deletion (6.4) | legal |

Tasks: **L-01 (K)** answer the legal questions in `fragen-an-karo.md`; **L-02 (T+K)** generate the six
pages, Karo confirms; **L-03 (C)** put them into each site's Tina pages (`impressum`, `datenschutz`).

---

## 9. Risks

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Watch paths wrong → a Tina save rebuilds nothing (change not live) | medium | Karo thinks saving is broken | CF-07 smoke test; generated lists (I-6); rule "include everything, exclude only foreign content" fails open (too many builds), not closed. |
| New site indexed on `workers.dev` before the domain | medium | duplicate URLs in Google | `SITE_NOINDEX` from day one (I-4), CF-06 after go-live. |
| Preview build fails because branch unknown in TinaCloud | high without O4 | no previews | Preview build command `build:local` (O4). |
| Image uploaded into another site's folder | medium | image missing on the site | `uploadDir` per field, content test (I-6), hint text in Tina. |
| Pfotentermin redirect blocked by "inactive tenant" handling | medium | 404 instead of redirect | Redirect runs before the active check (6.2), deactivate only after 4 weeks (C8). |
| Tenant delete cascades and wipes customer data | low | data loss | Never delete before export (P-03) and cascade check (P-07). |
| E-mail spoofing with the new domains | low | phishing in Karo's name | null MX / SPF `-all` / DMARC `p=reject` (O7). |
| Legal pages incomplete (§ 11 TierSchG, Widerruf) | medium | Abmahnung risk | Section 8, human check before C1. |
| Cloudflare product changes (Previews, Builds are recent) | medium | steps in this doc drift | Re-read the linked docs when executing CF-02…CF-04. |
| Domain taken before ordering | low | rename needed | Order early (A4), alternatives listed in section 0. |

---

## 10. Task summary

| Phase | Toni | Karo | Claude |
| --- | --- | --- | --- |
| Before go-live | P-01, CF-02…CF-05, T-01…T-03, A5 | A4 (domains), fragen-an-karo, L-01 | CF-01, S-01…S-03, (I-1…I-9 with slice 0) |
| Dachshund go-live | B2…B4, B6, S-05 | B1, S-04 | B5 |
| Training go-live | P-02, P-03, P-05, C2, C3, C5, C6 | P-04, C1, C7 | C4, L-03 |
| After | CF-06, P-06, P-07 | P-07 | README/CLAUDE.md update |
