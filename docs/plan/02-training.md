# Slice 2 – Training site "Alltag kann Sport"

Status: **planned** (2026-11-05). Builds on the guiding decisions D1–D10 in [`README.md`](README.md).
Content inventory: [`02-training-inhalte.md`](02-training-inhalte.md). Start-page mockup:
[`mockups/training/index.html`](mockups/training/index.html) (open it from the repo, it uses the images in
`public/uploads/training/`). Open questions: section "Hundetraining-Seite" in
[`fragen-an-karo.md`](fragen-an-karo.md).

## 1. Summary

Karo's training business moves from the Pfotentermin tenant `karolin-riesing` to a plain static site
built from this repo with `SITE_ID=training`. The site has 3 offers (Einzeltraining, Basistraining,
Welpenkurs), an about page (vita, philosophy, qualifications, Hundesport), an inquiry form instead of
booking, and its own look derived from Karo's logo (navy + copper), not from the Rottweiler site or
from Pfotentermin's red theme.

What this session already did:

- Captured every text, offer, contact detail and image of the live tenant (`02-training-inhalte.md`).
- Downloaded all images (20 files, 1.9 MB) to `public/uploads/training/` (D10, no Supabase hotlinks).
- Built the static start-page mockup.
- **Not done:** reading the Pfotentermin repo. Attaching `tonimoeckel/pfotentermin` was denied in
  this session, so seed/migration scripts weren't cross-checked. The live site is the source of
  truth anyway; nothing in the plan depends on the repo. Slice 3 needs the repo for the redirect.

## 2. Decisions

| # | Decision | Why |
| --- | --- | --- |
| T1 | **No booking, no payment, no calendar.** Every CTA is "Anfrage senden" → inquiry form. Group courses show a free-text status ("Nächster Kurs: Termine auf Anfrage" or "Start am 12.04."), edited by Karo. | D8. Pfotentermin currently has no dates planned for any offer anyway. |
| T2 | **Offers are a Tina collection** (`trainingAngebot`), not page blocks. Each offer gets its own detail page `/angebote/<slug>` with slugs `einzeltraining`, `basistraining`, `welpenkurs`. | Detail pages are needed for the 301s from `/services/<uuid>`, SEO per offer, and the form preselect. Same pattern as `hund`/`wurf`. |
| T3 | **Pages are block-based** like the Rottweiler site. Reuse `hero`, `text`, `highlights`, `galerie`, `cta`; add 4 training blocks: `angebote` (auto list), `zeitstrahl` (vita), `zitat`, `anfrage` (form). | Karo already knows the block editor; one component per block keeps Blocks.astro simple. |
| T4 | **Keep Karo's logo** (Rottweiler + Dackel + hurdle, "Karolin Riesing" script) and the name "Alltag kann Sport". **Drop the Pfotentermin red theme** (`friendly-red`, `#dc2626`). | The logo is Karo's own brand and gives recognition. The red was the Pfotentermin template theme and never matched the navy/copper logo. |
| T5 | **Own design system** (see §6): navy `#193450`, copper `#b96637`, mist `#c8d9e8`, paper `#f6f2ea`; Barlow Condensed (display) + Inter (body); "Hundeplatz" motifs (lane lines, numbered start bibs). Light + dark tokens, no colour-scheme switcher. | D5: clearly different from the Rottweiler site (orange→pink gradients, Bricolage, rounded). One scheme is enough; the switcher was a review tool. |
| T6 | **No AGB** (working assumption). Inquiries are not contracts; Karo confirms terms by e-mail. Optional short "Teilnahmebedingungen" text block (Impfschutz, Haftpflicht, Absage) if Karo wants. Impressum + Datenschutz are required. | Without online booking/payment there is no online contract. Question for Karo/Toni. |
| T7 | **No reviews/testimonials model now.** Pfotentermin shows "5.0 Bewertung" but there are 0 reviews; drop the badge. If Karo collects quotes later, the `zitat` block covers them. | Don't invent social proof (also a UWG risk). YAGNI. |
| T8 | **No second dog list.** The about page's "Mein Rudel" (outdated: Donna is in memoriam) becomes a short text + link to `vomluchberg.de/hunde`. | One source of truth for the dogs; no drift. Question for Karo. |
| T9 | **Canine Pure** stays as a short text section with an outbound link (no pages for it). | Live content; `caninepure.de` itself is out of scope (CLAUDE.md). Question for Karo. |
| T10 | **No Google Maps embed.** Address + "In Google Maps öffnen" link only. Instagram as link only. | D10, no third-party requests/cookies. |
| T11 | **Prices are shown** (working assumption, already asked in `fragen-an-karo.md`), with a per-offer `preisAnzeigen` toggle. | Karo can hide a price without Toni. |

## 3. Page map

| URL | Page | Built from | Title (`<title>`) | Meta description |
| --- | --- | --- | --- | --- |
| `/` | Start | page `home`: hero, highlights (facts band), angebote, text (Karolin teaser + values), highlights (Ablauf), galerie (Hundesport), anfrage | Hundetraining in Glashütte · Alltag kann Sport | Hundetraining für echte Alltagssituationen in Glashütte (Osterzgebirge): Einzeltraining, Basistraining und Welpenkurs bei Karolin Riesing – klar, fair, verständlich. Nur auf Anfrage. |
| `/angebote` | Angebote | page `angebote`: hero schmal, angebote, cta | Angebote: Einzeltraining, Basistraining, Welpenkurs · Alltag kann Sport | Einzeltraining ab 50 €, Basistraining und Welpenkurs in kleinen Gruppen bis 6 Hunde – Hundetraining in Glashütte, Sachsen. Jetzt unverbindlich anfragen. |
| `/angebote/einzeltraining` | Offer detail | collection `trainingAngebot` | Einzeltraining für Hund & Mensch in Glashütte · Alltag kann Sport | from `kurzbeschreibung` (+ "in Glashütte" fallback via `angebotSeo`) |
| `/angebote/basistraining` | Offer detail | 〃 | Basistraining – Hör auf damit, mach was mir gefällt · Alltag kann Sport | 〃 |
| `/angebote/welpenkurs` | Offer detail | 〃 | Welpenkurs in Glashütte · Alltag kann Sport | 〃 |
| `/ueber-mich` | Über mich | page: hero, text (Mein Weg), zeitstrahl, highlights (Philosophie), zitat, highlights (Qualifikationen), text + galerie (Hundesport), text (Rottweiler-Zucht → vomluchberg.de), text (Ernährungsberatung → caninepure.de), cta | Karolin Riesing – Hundetrainerin in Glashütte · Alltag kann Sport | Karolin Riesing: Übungsleiterin im Hundesportverein seit 2019, Ausbildung gleichwertig zur Trainer-C-Lizenz, Genehmigung nach § 11 TSchG, FCI-Prüfungen bis zur höchsten Klasse. |
| `/anfrage` | Inquiry | page: hero schmal, anfrage | Training anfragen · Alltag kann Sport | Schreib mir, was du und dein Hund braucht – ich melde mich persönlich. Trainingsgelände in Glashütte, Osterzgebirge. |
| `/impressum`, `/datenschutz` | Legal | page: text | Impressum / Datenschutz · Alltag kann Sport | – (`noindex` not needed) |

Header nav: Angebote · Über mich · Anfrage + button "Training anfragen". Footer: logo, short claim,
pages, contact, cross-link hint (D7), Impressum · Datenschutz.

Title pattern: `<page title> · Alltag kann Sport` via the existing `seo` domain fallbacks
(slice 0 makes the site name per-site).

### Local SEO

- `LocalBusiness` JSON-LD on `/` (and `Service` per offer detail page with `offers.price`/`priceCurrency`
  when the price is shown): name "Alltag kann Sport – Hundetraining Karolin Riesing", address Dorfstr. 2d,
  01768 Glashütte (OT Luchau), Sachsen, DE; `areaServed`: Glashütte, Dippoldiswalde, Altenberg,
  Osterzgebirge, Landkreis Sächsische Schweiz-Osterzgebirge; `email`; `telephone` (if Karo wants it);
  `sameAs`: Instagram, vomluchberg.de. `geo` only once Karo confirms the training ground (question:
  is group training at Dorfstr. 2d or at the Hundesportverein's ground?).
- Place names in H1/H2 and descriptions: "Glashütte", "Osterzgebirge", "Sachsen" (not keyword
  stuffing; already in Karo's texts).
- Slice 3: Google Business Profile "Hundetrainer" for Karo (biggest local lever), Search Console,
  sitemap submit.

## 4. Content model

All names below assume slice 0's per-site prefixing (`training…`) and folders `src/content/training/…`.
Labels for Karo are prefixed "Training · …" (D2).

### 4.1 Collection `trainingAngebot` – "Training · Angebote"

Path `src/content/training/angebote/*.md`, router `angebotUrl(slug)`, filename slugified from
`kurztitel`.

| Field | Type | Label (German) | Notes |
| --- | --- | --- | --- |
| `titel` | string, isTitle, required | Titel | "Basistraining – Hör auf damit, mach was mir gefällt" |
| `kurztitel` | string, required | Kurzname (Formular, Menü) | "Basistraining" – used in the form dropdown and mail subject |
| `untertitel` | string | Unterzeile | "Für Alltag, Verhalten oder Sport" |
| `art` | string options | Art | `einzel` (Einzeltraining) \| `gruppe` (Gruppenkurs) \| `welpen` (Welpenkurs) – drives the badge and the "bis zu N Hunde/Welpen" label |
| `reihenfolge` | number | Reihenfolge | smaller = first |
| `sichtbar` | boolean | Auf der Website zeigen | default true; hidden offers aren't built and aren't in the form |
| `kurzbeschreibung` | string textarea | Kurzbeschreibung (Karte, Google) | |
| `body` | rich-text, isBody | Beschreibung | |
| `dauerMinuten` | number | Dauer pro Termin (Minuten) | 45 |
| `anzahlTermine` | number | Anzahl Termine | Basistraining: 4; empty = single |
| `maxTeilnehmer` | number | Max. Hunde pro Gruppe | empty for Einzeltraining |
| `preis` | number | Preis in € | 50 / 25 |
| `preisEinheit` | string options | Preis gilt pro | `termin` \| `kurs` |
| `preisAnzeigen` | boolean | Preis anzeigen | default true (T11) |
| `aufAnfrage` | boolean | Nur nach Absprache | badge "Auf Anfrage" |
| `terminHinweis` | string | Nächste Termine (Text) | e.g. "Termine auf Anfrage", "Start am 12.04., samstags 10 Uhr" |
| `ort` | string | Treffpunkt | default from site config ("Trainingsgelände Glashütte") |
| `mitbringen` | string list | Das solltest du mitbringen | Welpenkurs list |
| `voraussetzungen` | string textarea | Voraussetzungen | e.g. puppy age, vaccinations (ask Karo) |
| `bild` | image (shared `bildFeld`) | Hauptbild | |
| `galerie` | shared `galerieFeld` | Weitere Bilder | |

Sibling-field note: this is a collection, not a block, so names don't clash with block templates.
`galerie` reuses the existing shared field definition (same type everywhere).

Initial content (from the inventory):

| Slug | art | dauer | Termine | max | preis | Einheit | aufAnfrage | bild |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `einzeltraining` | einzel | 45 | – | – | 50 | termin | true | `angebote/einzeltraining-1.jpg` (+2, +3) |
| `basistraining` | gruppe | 45 | 4 | 6 *(text says 4 – ask)* | 25 | termin *(ask)* | false | `hundesport/fussarbeit-hundeplatz.jpg` (+training-hundeplatz, drei-rottweiler-platz) |
| `welpenkurs` | welpen | 45 | – *(ask)* | 6 | 25 | termin | false | `angebote/welpenkurs-rottweilerwelpe.jpg` |

### 4.2 New block templates (training page collection)

Field names checked against existing templates (`ueberschrift`/`text` strings, `inhalt` rich-text,
`items` object list in `highlights`). New list fields get **new names** so no two templates share a
name with a different type/shape.

| Template | Label | Fields |
| --- | --- | --- |
| `angebote` | Angebote-Übersicht (automatisch) | `ueberschrift` string, `text` string textarea, `auswahl` string options (`alle` \| `gruppe` \| `einzel`) |
| `zeitstrahl` | Werdegang (Zeitstrahl) | `ueberschrift` string, `text` string textarea, `stationen` object list {`zeit` string, `titel` string, `beschreibung` string} |
| `zitat` | Zitat | `zitat` string textarea, `autor` string, `bild` image (optional) |
| `anfrage` | Anfrageformular | `ueberschrift` string, `text` string textarea, `kontaktZeigen` boolean |

Reused unchanged: `hero`, `text` (Mein Weg, Hundesport, Zucht, Ernährung; the `text` block has no
buttons, so the two outbound links to vomluchberg.de and caninepure.de are `cta` blocks or inline
links in the rich text, and `text` stays untouched), `highlights` (facts band,
Philosophie, Qualifikationen, Ablauf), `galerie`, `cta`. Not offered on the training site: `hunde`,
`wuerfe`, `news`, `kontakt` (Rottweiler-specific, e.g. hard-coded `@luchberg_rottis`).

Hundesport tags (BH, IGP, …) go into the text as a list. If Karo wants chips like the mockup, a
later `stichworte` string list on a training-only block is cheap.

### 4.3 Settings `trainingConfig` – "Training · Einstellungen"

Shape I need from slice 0's per-site config (JSON, global, create/delete off):

```ts
website: { name, untertitel, beschreibung, logo, logoDunkel, teilenBild }
kontakt: { name /* Karolin Riesing */, ortName /* Trainingsgelände Glashütte */, strasse, ort,
           region /* Osterzgebirge, Sachsen */, telefon, email, mapsLink }
social:  { instagram, instagramName }
anfrage: { betreff /* "Neue Trainingsanfrage" */, danke /* status text */, hinweis /* "Das ist noch keine verbindliche Buchung …" */ }
querverweis: { text, link }   // D7 footer hint → vomluchberg.de (and the dachshund site later)
nav: [{ titel, link }]
```

Initial values: name "Alltag kann Sport", untertitel "Hundetraining Karolin Riesing", email
`bruosdonnalina2018@gmail.com`, telefon empty until Karo decides, Instagram
`https://www.instagram.com/karoriesing_caninepure`, logo `/uploads/training/logo/logo.png`,
logoDunkel `/uploads/training/logo/logo-hell.png`, teilenBild `/uploads/training/start/spaziergang-feldweg.jpg`.

### 4.4 Domain modules (pure, tested, no Astro/Tina imports)

`src/lib/domain/angebot.ts`

- `angebotArten` options + `artLabel(art)` ("Einzeltraining" / "Gruppenkurs" / "Welpenkurs")
- `angeboteListeUrl = '/angebote'`, `angebotUrl(slug)`, `anfrageUrl(slug?)` → `/anfrage?angebot=<slug>`
- `sortiereAngebote(list)` by `reihenfolge`, then `titel`; `sichtbareAngebote(list, auswahl)`
- `formatPreis({ preis, preisEinheit, preisAnzeigen })` → `"50 € / Termin"`, `"100 € / Kurs"`, `null`
  (de-DE, no decimals when whole)
- `angebotFakten(a)` → chip list: `"45 Min."`, `"4 Termine à 45 Min."`, `"bis zu 6 Hunde"` /
  `"bis zu 6 Welpen"` / `"1 Mensch-Hund-Team"`, `"Vor Ort"`
- `angebotSeo(a)` → `Seo` with title, description fallback, image
- `angebotJsonLd(a, site)` → `Service` object (price only if shown)

`src/lib/domain/anfrage.ts`

- `anfrageOptionen(angebote)` → `[{ value: slug, label: kurztitel }, …, { value: 'beratung', label: 'Ich bin noch unsicher – bitte beraten' }]`
- `vorauswahl(param, optionen)` → valid slug or `''` (guards against arbitrary query values)
- `wunschzeiten` constant (Wochentags vormittags/nachmittags/abends, Wochenende)
- `anfrageBetreff(daten)` → `"Trainingsanfrage: Basistraining – Anna Muster"`
- `anfrageMailText(daten)` → plain-text body for the `mailto:` fallback (all fields, labelled, empty
  ones skipped)

`src/lib/domain/seo.ts` (extend, or new `localBusiness.ts`): `localBusinessJsonLd(config)`.

## 5. Inquiry flow

```
Offer card / detail page ──"Anfrage senden"──▶ /anfrage?angebot=basistraining#formular
                                               (detail page: form inline, offer preselected server-side)
Form submit ──JS──▶ Web3Forms (PUBLIC_WEB3FORMS_KEY of the training worker) ──▶ Karo's inbox
            └─no key / no JS fetch──▶ mailto:<kontakt.email>?subject=…&body=… (anfrageMailText)
```

- Component `src/components/training/AnfrageFormular.astro` with props `angebote`, `vorausgewaehlt?`.
  Used by the `anfrage` block (preselect from `?angebot=` via a few lines of inline JS using the
  option values rendered at build time) and inline at the bottom of each offer detail page
  (preselect rendered server-side, works without JS).
- Fields: Angebot* (select) · Name* · E-Mail* · Telefon · Hund: Name, Rasse/Mix, Alter · "Was wünschst
  du dir vom Training?"* · Wunschzeiten (checkboxes) + free text · Datenschutz consent* · honeypot
  `botcheck`. Web3Forms hidden fields: `access_key`, `subject` (set by JS from `anfrageBetreff`),
  `from_name` "Alltag kann Sport Website", `replyto` = email.
- Status messages inline (`role="status"`), copy from `trainingConfig.anfrage`. Hint under the button:
  "Das ist noch keine verbindliche Buchung. Ich melde mich persönlich bei dir."
- Shared client code: extract the submit handler from `Kontakt.astro` into
  `src/scripts/formular.ts` (bundled module, `data-formular` attribute, fallback builder passed per
  form) so both sites share one implementation. Rottweiler form behaviour must stay identical.
- Datenschutz text must mention Web3Forms (processor, US transfer/SCC) – same as the Rottweiler site.
- Web3Forms access key: one per site/e-mail (the key is bound to the receiving address). Slice 3
  registers it for Karo's training e-mail.

## 6. Design proposal

See the mockup. Direction: **"Trainingsplatz"** – sporty, structured, outdoorsy; the Rottweiler
site is warm, round and gradient-heavy, this one is condensed, angular and calm.

- **Colours** (from the logo): navy `#193450` (text, dark bands), copper `#b96637` (buttons,
  accents; `#9a4f25` for copper text on light backgrounds, AA), mist `#c8d9e8` / `#e4edf5` (chips,
  lane lines), paper `#f6f2ea` / `#efe8db` (backgrounds), ink `#14253a`, muted `#4d5d70`. Dark mode:
  navy `#0f1f33` background, paper text, copper unchanged, mist for muted.
- **Type**: Barlow Condensed 600/800 (+800 italic for the "Sport." accent) uppercase for display;
  Inter (already installed) for body. Self-hosted via `@fontsource/barlow-condensed`.
- **Motifs**: diagonal lane lines (CSS `repeating-linear-gradient`), numbered "start bib" offer
  cards (01/02/03), fact chips like a training plan, small radius (6 px) instead of pills, no
  gradients, no glow.
- **Photos**: Karo's real photos only, `object-fit: cover`; hero uses the walk on the field path
  (Alltag), the sport strip uses Hundeplatz photos (Sport) – the name in pictures.
- **Logo**: the PNG is only 332×200; looks fine at 52 px header height, but ask Karo for the
  vector/original for crisp rendering and a proper favicon set (`favicon.png` 512 px exists).
- Implementation: tokens in `src/styles/sites/training.css` mapped onto the **same semantic Tailwind
  names** (`bg`, `surface`, `fg`, `muted`, `primary`, `primary-ink`, `accent`, …) so shared
  components keep working; training-only utilities (`lanes`, `bib`, `display`) as `@utility`.

## 7. Implementation tasks (commit-sized)

Each task ends with `npm test`, `npm run build:local` and `npx astro check` (0/0) for **both**
`SITE_ID=luchberg` and `SITE_ID=training` (exact commands per slice 0), plus the Rottweiler build
output diffed against `main` where routes/shared components change.

| # | Commit | Files | Tests / verification |
| --- | --- | --- | --- |
| 1 | Add training domain: offers | `src/lib/domain/angebot.ts`, `angebot.test.ts` | unit: sorting, visibility filter, `formatPreis` (whole/decimal, Termin/Kurs, hidden), `angebotFakten` per art, URLs, SEO fallback, JSON-LD without price when hidden |
| 2 | Add training domain: inquiry | `src/lib/domain/anfrage.ts`, `anfrage.test.ts` | unit: options incl. "beratung", `vorauswahl` rejects unknown/garbage, subject, mail body skips empty fields and joins Wunschzeiten |
| 3 | Add training offer collection | `tina/collections/training-angebot.ts`, register in `tina/config.ts` (via slice 0's per-site list), loaders/types in `src/lib/data.ts`, `detailseite('trainingAngebot', …)` in `detailseiten.ts`, route `src/pages/angebote/[slug].astro` (site-gated), `src/components/islands/AngebotBody.astro` | build: 3 detail pages for training, 0 for luchberg; Tina local mode opens and live-edits an offer |
| 4 | Add training offer content | `src/content/training/angebote/{einzeltraining,basistraining,welpenkurs}.md` | texts verbatim from inventory; images resolve (no 404 in build output) |
| 5 | Add training blocks | `tina/blocks/training.ts` (`angebote`, `zeitstrahl`, `zitat`, `anfrage`), `src/components/blocks/{AngeboteBlock,Zeitstrahl,Zitat,AnfrageBlock}.astro`, cases in `Blocks.astro` | `tina build`/codegen succeeds (sibling-field check); `data-tina-field` on every editable element |
| 6 | Share the form submit script | `src/scripts/formular.ts`, `Kontakt.astro` uses it | Rottweiler contact form unchanged: manual test with and without `PUBLIC_WEB3FORMS_KEY` (mailto) |
| 7 | Add inquiry form | `src/components/training/AnfrageFormular.astro`, used by `AnfrageBlock` and `AngebotBody` | Playwright smoke (manual or script): `/anfrage?angebot=welpenkurs` preselects; detail page preselects without JS; mailto fallback body contains all fields |
| 8 | Training settings, header, footer | `tina/collections/training-config.ts`, `src/content/training/config/config.json`, `src/components/training/{Header,Footer}.astro` (or slice 0's per-site slots) | header/footer render from config; cross-link hint present |
| 9 | Training design tokens + fonts | `src/styles/sites/training.css`, `package.json` (`@fontsource/barlow-condensed`), font imports in the training layout | contrast check (copper-ink on paper ≥ 4.5:1, white on copper ≥ 3:1 for large button text – use 800 weight), light + dark, 390 px / 1366 px screenshots, no horizontal overflow |
| 10 | Training pages | `src/content/training/seiten/{home,angebote,ueber-mich,anfrage,impressum,datenschutz}.md` | every page from §3 builds; texts match inventory; new copy marked in the PR for Karo |
| 11 | SEO for training | per-site `BaseHead` data (favicon from `logo/favicon.png`, `theme-color #193450`, OG image), JSON-LD (`LocalBusiness`, `Service`), sitemap + robots via slice 0 | unit tests for JSON-LD builders; validate JSON-LD output in build HTML; sitemap lists 9 URLs |
| 12 | Old-path redirects on the new site | per-site `redirects`: `/services` → `/angebote`, `/ueber-uns` → `/ueber-mich`, `/book` → `/anfrage`, `/bewertungen` → `/` | build output contains redirect pages |
| 13 | Docs | `CLAUDE.md` (training collections/blocks, design tokens), `README.md` (training worker env) | – |

Tasks 1–2 have no slice-0 dependency and are **done** (`src/lib/domain/angebot.ts`, `anfrage.ts` with tests).
Note for the form (task 7): `anfrageFelder` fixes the field names, `anfrageAusFormular` reads them, and
`anfrageMailto` builds the fallback. 3–12 need slice 0 merged.

## 8. Dependencies on slice 0 (interface I need)

1. **Site selection**: a build-time `SITE_ID` accessor (e.g. `import { siteId } from 'src/lib/site'`) and
   a way for routes to emit paths only for the active site (`getStaticPaths` returns `[]`, or
   per-site page dirs). Training needs `/angebote/[slug]` which must not exist on the Rottweiler build.
2. **Per-site Tina collections in one schema**: a training page collection with **its own block
   template list** (so Karo doesn't see `hunde`/`wuerfe` blocks on the training site and vice
   versa), plus `trainingAngebot` and `trainingConfig`. Content paths `src/content/training/{seiten,angebote,config}`.
   Tina `ui.router` must produce the training preview URL.
3. **Per-site config loader** returning the shape in §4.3 (or a typed union keyed by site).
4. **Per-site layout hook**: `<html data-site="training">`, per-site CSS token file, per-site Header/Footer
   components and per-site `BaseHead` inputs (favicon, theme-color, site name, JSON-LD slot).
5. **Per-site** `redirects`, `site` (`SITE_URL`), sitemap and robots.
6. **Per-site env**: `PUBLIC_WEB3FORMS_KEY`, `SITE_URL` set on each Worker.
7. **Uploads**: `public/uploads/training/` is already in place (D4). If slice 0 filters `public/`
   per site to keep each Worker small, training needs `uploads/training/**` only.
8. **Island registry** (`islands.ts`) must include `trainingAngebot` and the training header/footer.

## 9. URL mapping (old Pfotentermin → new) for the 301s (slice 3)

New domain is TBD (`alltag-kann-sport.de`?); paths below are relative to it. Both old URL forms
(subdomain root and `/s/karolin-riesing/…`) must redirect. Query strings are dropped except where noted.

| Old (`karolin-riesing.pfotentermin.eu…`) | New |
| --- | --- |
| `/`, `/s/karolin-riesing` | `/` |
| `/services`, `/s/karolin-riesing/services` | `/angebote` |
| `/services/bff4106e-9676-4b1c-adfb-7c3c4aefbdd3` (+ `/s/karolin-riesing/…`) | `/angebote/einzeltraining` |
| `/services/670bef78-8545-4fa8-8c5d-3b0e7a785dbf` (〃) | `/angebote/basistraining` |
| `/services/20d50494-4833-4805-be2e-f82d2d57b30c` (〃) | `/angebote/welpenkurs` |
| `/ueber-uns`, `/s/karolin-riesing/ueber-uns` | `/ueber-mich` |
| `/bewertungen`, `/s/karolin-riesing/bewertungen` | `/` |
| `/book…`, `/s/karolin-riesing/book…` | `/anfrage`; with `?service=<uuid>` → `/anfrage?angebot=<slug>` (uuid → slug as above) |
| `/s/karolin-riesing/kontakt` | `/anfrage` |
| any other storefront path | `/` (customer-account paths like `/profile/**`, `/login`, `/auth/**` go to the Pfotentermin platform instead, and `/buchungen/<id>` stays a private customer page: `03-betrieb.md` §6.3 is authoritative) |

Pfotentermin legal pages for the tenant are 404 today; nothing to map. Also: Pfotentermin's own
`sitemap.xml` lists 4 tenant URLs – remove them when the tenant is deactivated (slice 3).

## 10. Risks

| Risk | Mitigation |
| --- | --- |
| Slice 0 interface differs from §8 | Tasks 1–2 are independent; adjust 3–12 to slice 0's real API, the content model stays. |
| Tina codegen conflicts between site block templates (sibling-field gotcha), now across two template lists in one schema | New list fields use unique names (`stationen`); run Tina codegen in task 5 before writing components. |
| Conflicting offer data (Basistraining 4 vs 6 dogs, price per Termin vs course, Welpenkurs details) | Asked in `fragen-an-karo.md`; content uses the live data model values until answered, marked in the PR. |
| Logo only as 332 px raster | Fine at header size; ask for vector. |
| Unconfirmed claims (Trainer-C "gleichwertig", § 11 TSchG) are legally sensitive for a trade website | Keep Karo's exact wording; she confirms they're current (question). Show the § 11 authority in the Impressum if she wants. |
| Spam via the public form | Web3Forms honeypot + their spam filter; no captcha (no third-party scripts). |
| SEO dip on switch | Small site; 301s for every old URL (§9), Search Console + new sitemap in slice 3. |
| Photo/people rights | All photos show Karo and her dogs, supplied by her for Pfotentermin. The photographer is unknown – ask whether credits are needed. |
| Pfotentermin repo not inspected | Live site was the source of truth; slice 3 must read the repo for the redirect implementation anyway. |
