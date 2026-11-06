# Plan: three sites for Karo in one repo

Status: **planning** (started 2026-11-05). Open questions for Karo are collected in
[`fragen-an-karo.md`](fragen-an-karo.md) (German, Toni clears them with Karo in about a week).
Until then every slice proceeds on the **working assumptions** below and marks anything that
depends on an open question.

## Goal

Karo wants two more websites next to `vomluchberg.de` (Rottweiler):

1. **Dachshund site** (Rauhaardackel / wire-haired dachshunds). Her words: someone looking for a
   dachshund will never find it on a Rottweiler site, so it must be its own, separate site with a
   **completely different design**. Both sites only carry a short cross-link hint to each other.
2. **Dog training site** ("Alltag kann Sport"). Today it is a Pfotentermin tenant
   (`https://karolin-riesing.pfotentermin.eu/s/karolin-riesing`, source in
   `github.com/tonimoeckel/pfotentermin`). She does not need online booking yet and works
   **on request only**, so it moves into this repo as a plain website with an inquiry form.

## Guiding decisions (working assumptions, to be validated in slice 0)

| # | Decision | Why |
| --- | --- | --- |
| D1 | **One repo, one Astro codebase, three sites**, selected at build time by an env var `SITE_ID` = `luchberg` \| `dackel` \| `training`. | Shared toolchain, components, tests and one place for Toni to maintain. |
| D2 | **One TinaCloud project / one `/admin`** with per-site collections (labels prefixed, e.g. "Dackel · Würfe"). | Karo logs in once and edits all three sites. TinaCloud indexes one schema per repo. |
| D3 | **Three Cloudflare Workers** built from the same repo (`vomluchberg`, `vomluchberg-dackel`, `alltag-kann-sport` – names TBD), each with its own `SITE_ID`, `SITE_URL` and later its own domain. Until domains exist they run on `*.workers.dev`. | Separate domains are what makes the dachshund site findable on its own; independent deploys. |
| D4 | **Per-site content folders** `src/content/<site>/…` and per-site uploads `public/uploads/<site>/…`. The existing Rottweiler content stays where it is until slice 0 decides whether moving it is worth the churn (redirects + Tina paths). | Keeps Karo's existing edits and URLs safe. |
| D5 | **Per-site design**: each site has its own token set / layout. The Rottweiler design is untouched. Dachshund and training get their own look (not just a colour scheme). | Karo explicitly asked for a completely different design. |
| D6 | **Domain logic stays pure and reusable** (`src/lib/domain/*`): the dachshund site reuses the `hund` / `wurf` rules where they fit (litters, puppies, dates) instead of copying them. | Same tested rules, no drift. |
| D7 | **Cross-links are a tiny hint only**: a footer line / small card "Wir züchten auch Rauhaardackel → …" and back. No shared navigation. The Rottweiler dog profile `/hunde/rauhaardackel` becomes a short teaser pointing to the new site (later possibly a 301). | Karo: "sodass nur ein Hinweis besteht". |
| D8 | **Training site works "auf Anfrage"**: offers/courses are listed (description, duration, price if Karo wants it shown), every CTA leads to an inquiry form (Web3Forms, `mailto:` fallback like the Rottweiler contact form). No booking, no AGB unless Karo needs them. | Matches how she works today. |
| D9 | **Pfotentermin tenant stays live until the new training site is live**, then the tenant URL redirects (301) to the new domain and the tenant is deactivated. | No gap for her customers or Google. |
| D10 | GDPR rules from `CLAUDE.md` apply to all sites: self-hosted fonts, no tracking, no cookies, images served from the repo (no hotlinking to Supabase). | Same legal baseline. |
| D11 | **Dachshund design = direction A "Wiesenweg"** (slice 1 mockup `mockups/dackel/index.html`), calm and plain. **No decorative animation** and no animation toggle: only the small hover lift on cards, nothing on scroll. Directions B–H are dropped. | Karo's feedback 2026-11-06: she and two friends liked the first, plain proposal best; the animated variants are fun but could annoy visitors, and she would not switch them on. |

Working names until Karo decides: **"Rauhaardackel vom Luchberg"** and **"Alltag kann Sport – Hundetraining Karolin Riesing"**.

## Slices

Each slice is planned in its own session and writes its plan to `docs/plan/<nn>-<slice>.md`,
plus its open questions into its own section of `fragen-an-karo.md` (only that section, to keep
merges trivial).

| Slice | Plan file | Scope | Depends on |
| --- | --- | --- | --- |
| 0 – Multi-site foundation | `00-multisite.md` | `SITE_ID` mechanism, per-site routes/pages, content + uploads layout, per-site config/Tina collections in one schema, per-site `BaseHead`/sitemap/robots/redirects, per-site Cloudflare build + wrangler config, tests, migration path for the existing site without breaking it | – |
| 1 – Dachshund site | `01-dackel.md` | Content model (dogs, litters, puppies, news?), page structure, completely new design direction, initial content from `src/content/hunde/rauhaardackel.md` + `public/uploads/rudel/dackel/`, cross-link changes on the Rottweiler site | 0 (mechanism), can plan in parallel |
| 2 – Training site | `02-training.md` | Content inventory + migration from Pfotentermin (texts, offers, about/vita, qualifications, images from public Supabase storage), content model (offers, about, philosophy, timeline), inquiry form, design direction, legal pages | 0 (mechanism), can plan in parallel |
| 3 – Domains, deploy & Pfotentermin sunset | `03-betrieb.md` | Domains for both new sites, Cloudflare Workers setup, TinaCloud rebuild triggers for three workers, SEO (canonical, sitemaps, Search Console), cross-link placement on all three sites, legal pages per site, redirect + deactivation of the Pfotentermin tenant | 0, 1, 2 |

Suggested implementation order after planning: **0 → (1 ∥ 2) → 3**. Slice 0 must land first
because it moves files the other slices build on.
