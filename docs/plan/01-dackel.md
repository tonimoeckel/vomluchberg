# Slice 1 – Dachshund site ("Rauhaardackel vom Luchberg")

Status: **plan**, 2026-11-05. Depends on slice 0 (`00-multisite.md`) for the multi-site mechanism.
Open questions for Karo are in [`fragen-an-karo.md`](fragen-an-karo.md) → "Rauhaardackel-Seite".
Design (decided 2026-11-06, see D11 in `README.md`): direction **A "Wiesenweg"**, plain, no decorative animation.
Mockup (open locally in a browser, it loads the real photos from `public/uploads/rudel/dackel/`):
[`mockups/dackel/index.html`](mockups/dackel/index.html), full-page screenshot
[`mockups/dackel/wiesenweg-desktop.jpg`](mockups/dackel/wiesenweg-desktop.jpg).
The dropped directions B–H (mockups and screenshots) stay on the branch `claude/plan-01-dackel` for reference.

## 1. Decisions

| # | Decision | Why |
| --- | --- | --- |
| K1 | Own site `SITE_ID=dackel`, working name **"Rauhaardackel vom Luchberg"**, small and focused: 5 content pages + 2 legal pages. | Karo: someone looking for a dachshund must find a dachshund site. Small = she can keep it current. |
| K2 | **Reuse the pure domain modules** (`hund`, `wurf`, `datum`, `slug`, `seo`) by parameterising the few Rottweiler-specific parts (category list, SEO suffix, URL bases). No copies. | D6, one tested rule set. |
| K3 | **Separate Tina collections per site** (`dackelHund`, `dackelWurf`, `dackelPage`, `dackelConfig`), labels prefixed "Dackel · …". Their field sets are built from shared field factories. | D2. Separate collections keep paths, routers and Karo's mental model apart. |
| K4 | **No news collection at launch.** "Aktuelles" on this site = litter status (`geplant` / `aktuell`) plus an optional one-line `hinweis` in the config ("Derzeit keine Welpen …"). | Karo has never posted dachshund news; an empty news page hurts more than it helps. Can be added later by reusing `news` with a site-scoped collection. |
| K5 | **No club claims until Karo answers** (DTK/VDH vs. Liebhaberzucht). Copy uses only what she wrote: "Standard Rauhaardackel", "für Liebhaber und Familien", "Gesundheit und Wesen", "jagdliche Abstammungen". No "Papiere", "Zuchtstätte im DTK", "VDH-Welpen", "Zuchtwart", "Wurfabnahme" anywhere. Club fields exist in the model but stay empty/hidden. | Wrong claims about papers are a legal and trust risk (UWG). The old site headed the text "Rauhaardackel aus Hobbyzucht", which hints at Liebhaberzucht, but it must be confirmed. |
| K6 | **Design direction A "Wiesenweg"** (editorial, paper + meadow green + rust, serif display). **Decided by Karo 2026-11-06.** It shares no tokens, fonts, radii or gradients with the Rottweiler site. No decorative animation and no animation toggle (only the small hover lift on cards). | D5, D11. Karo wants a completely different but plain look; animation "could annoy people". |
| K7 | **Cross-link = one hint each way** (footer card on both sites, plus the teaser on `/hunde/rauhaardackel`). No shared nav. `/hunde/rauhaardackel` stays a page until the dachshund site has its final domain, then becomes a 301 (slice 3). | D7. |
| K8 | Dachshund images move to `public/uploads/dackel/…` (per D4), but the files referenced by the Rottweiler teaser stay where they are until the teaser is reduced. | Avoid broken images on the Rottweiler site during the transition. |

## 2. Audience & SEO

**Who searches:** families and couples (often first dachshund, sometimes experienced dachshund
owners) in Saxony and neighbouring regions – Dresden, Freital, Pirna, Dippoldiswalde, Chemnitz,
Erzgebirge, Osterzgebirge, also northern Bohemia/Brandenburg for "Welpen" queries. Typical intent:
"Gibt es bald Welpen? Wie wachsen sie auf? Sind die Elterntiere nett? Kann ich anfragen?" A
smaller group are hunters looking for "jagdliche Leistungszucht"; Karo explicitly does **not** train
for hunting, so we mention the hunting lineage honestly but don't target hunters.

**Keywords (German):**

- Primary: `Rauhaardackel Welpen Sachsen`, `Rauhaardackel Züchter Sachsen`, `Rauhaardackel Welpen Dresden`, `Rauhaardackel Erzgebirge`, `Dackelwelpen Sachsen`.
- Secondary: `Standard Rauhaardackel`, `Rauhaardackel Familienhund`, `Rauhaardackel Welpen kaufen` (only on the Welpen page, phrased as "anfragen"), `Rauhaardackel Glashütte` / `Osterzgebirge`.
- Club-dependent (only after Karo confirms DTK/VDH): `Rauhaardackel mit Papieren`, `DTK Züchter Sachsen`. Until then: none.

**SEO mechanics** (mostly from slice 0/3): own domain + canonical, own sitemap, `LocalBusiness`
-ish JSON-LD is *not* added for a hobby breeder (keep it at `Organization`/`WebSite` – slice 3
decides), German `lang`, real alt texts on every photo (currently file names are UUIDs, Tina's
gallery `beschreibung` doubles as alt text → fill them).

### Page map

| Route | Page | `<title>` (site name appended by `headMeta`) | Meta description |
| --- | --- | --- | --- |
| `/` | Start | "Rauhaardackel vom Luchberg – Rauhaardackel aus Sachsen" (index: full title, no suffix) | "Standard-Rauhaardackel aus Glashütte OT Luchau (Sachsen): mit Familienanschluss im Rudel aufgewachsen, mit Blick auf Gesundheit und Wesen. Anfragen nehmen wir gern entgegen." |
| `/unsere-dackel` | Unsere Dackel (list) | "Unsere Dackel" | "Lernt Hanni, Bonnie und den Vater unserer Dackel kennen – unsere Rauhaardackel sind absolute Familienhunde, gut sozialisiert und erzogen." |
| `/unsere-dackel/[slug]` | Dog detail | "{Rufname}" | "{Name} – {Eltern}. Rauhaardackel vom Luchberg." (via parameterised `hundSeo`) |
| `/welpen` | Welpen & Würfe (list) | "Welpen" | "Ihr sucht einen Rauhaardackel-Welpen in Sachsen? Hier findet ihr unsere geplanten und aktuellen Würfe – Anfragen nehmen wir gern entgegen." |
| `/welpen/[slug]` | Litter detail | "{A-Wurf} vom Luchberg" | `kurztext` |
| `/ueber-uns` | Über uns & Aufzucht | "Über uns & Aufzucht" | "Bei uns wachsen die Kleinen mit Familienanschluss und im Rudel auf und lernen alles Wichtige für ihren neuen Lebensweg." |
| `/kontakt` | Kontakt / Anfrage | "Kontakt" | "Ihr interessiert euch für einen Rauhaardackel? Schreibt uns – wir stehen euch mit Rat und Tat zur Seite." |
| `/impressum`, `/datenschutz` | Legal | – | – (`noindex` not needed) |

URL bases are German and match search terms ("Welpen" beats "Würfe" for this audience). A gallery
page is **not** planned: 14 photos are better used on Start (photo band), the dog pages and Über uns.
A breed-info page ("Der Rauhaardackel") would rank well but needs text Karo hasn't written – listed
as an optional follow-up, not invented here.

## 3. Content model

### What slice 1 needs from slice 0 (interface, not design)

1. `SITE_ID` available at build time and in Tina config; one Tina schema with all collections.
2. A per-site place for **routes** (e.g. `src/sites/dackel/pages/**` or a route switch) and for **the
   island registry** (`detailseiten` per site).
3. Per-site **content root** `src/content/dackel/**` and **media root** `public/uploads/dackel/**`
   (Tina media can stay `public/uploads`; Karo picks the `dackel/` folder).
4. Per-site **layout + stylesheet entry** (own `global.css`-equivalent with the same semantic token
   names, own `BaseHead` data: theme-color, favicon, `lang`, site name).
5. Per-site `redirects` map, sitemap, robots, and `SITE_URL` (slice 0/3).
6. A helper that tells a collection which site it belongs to, so `data.ts` loaders, `ui.router` and
   the config loader pick the right collection (e.g. `site.collections.hund === 'dackelHund'`).

If slice 0 instead chooses a single `page`/`hund` collection with a `site` field, the plan below still
holds: the dachshund-specific fields go into a `dackel` object field, and the category options are
filtered per site. The only hard requirement is that **site-specific option lists do not leak** into
the other site's admin forms.

### Collections

| Collection | Path | Based on | Dachshund-specific |
| --- | --- | --- | --- |
| `dackelConfig` (global, "Dackel · Einstellungen") | `src/content/dackel/config/config.json` | `config` | No `farbschema` (one scheme, light+dark), no `workingDog`; `verband`/`verbandLink` kept but empty until K5 is answered; new `hinweis` (string, short status line) and `querverweis` (object: `text`, `link`, `bild`) for the Rottweiler hint. |
| `dackelPage` ("Dackel · Seiten") | `src/content/dackel/seiten/*.md` | `page` | Same block templates minus `news`, plus none new at launch (see below). |
| `dackelHund` ("Dackel · Unsere Dackel") | `src/content/dackel/hunde/*.md` | `hund` | See fields below. |
| `dackelWurf` ("Dackel · Würfe & Welpen") | `src/content/dackel/wuerfe/*.md` | `wurf` | Puppy `farbe`; parent links are free links (no working-dog.com label). |

**`dackelHund` fields** – shared factory fields (`name`, `rufname`, `geschlecht`, `kategorie`,
`reihenfolge`, `geboren`, `verstorben`, `eltern`, `gesundheit`, `bild`, `body`, `galerie`) plus:

| Field | Type | Notes |
| --- | --- | --- |
| `farbe` | string with options + free text? → **string with options** `wildschweinfarben`, `dürrlaubfarben`, `rot`, `schwarz-rot`, `sonstige` | Karo picks; labels in `src/lib/domain/dackel.ts`. Avoid a free-text field to keep cards consistent. |
| `groesse` | string options `standard` / `zwerg` / `kaninchen`, default `standard` | Shown as "Standard-Rauhaardackel"; options exist so a future Zwerg doesn't need a schema change. |
| `abstammung` | string, textarea | "Jagdliche Abstammung …" in Karo's words. Not called `eltern` (that already exists as one-line string). |
| `brustumfang` | string | Optional, e.g. "34 cm". String, not number (unit, and Tina number fields show 0). |
| `auswaertig` | boolean "Gehört nicht zu uns (z. B. Deckrüde)" | For "Der Vater unserer Dackel": shown with owner/kennel line instead of "unser". |
| `besitzer` | string | Only for `auswaertig` dogs. |

`leistungen` (Prüfungen & Titel) and `workingDog` are **not** in the dachshund form (no titles known,
not hunting-trained). If DTK membership is confirmed, `zuchtbuchnummer` can be added later.

Categories (`dackelKategorien`): `zucht` → "Unsere Hündinnen", `deckrude` → "Der Vater unserer
Dackel", `erinnerung` → "In Erinnerung". (No "Zur Aufzucht", no "Weitere Rudelmitglieder".)

**`dackelWurf` fields** – the full `wurf` field set (titel, buchstabe, status, wurfdatum, vater,
vaterLink, mutter, mutterLink, kurztext, bild, body, welpen, galerie) with labels "Vater – Link" /
"Mutter – Link" (no working-dog.com). Puppy object gets `farbe` (same options as the dog). Puppy
`notiz` stays the place for "vermittelt" / "noch frei"; an explicit `status` option on puppies is
tempting but would be a Rottweiler change too – defer.

**Tina sibling-field gotcha:** within one collection's block union, a field name must have one type.
The dachshund blocks reuse the Rottweiler templates as-is (`text` block → `inhalt` rich text, others
→ `text` string), so nothing new is introduced. Any future dachshund-only block must follow the same
rule (rich text never named `text`; `bild` always `image`; `farbe` always string). Different
collections (`hund` vs. `dackelHund`) are separate GraphQL types and may differ freely – but keep
equal names equal in type anyway so the shared components type-check against both.

### Domain modules (D6)

Today's Rottweiler-specific bits and how to parameterise them – Rottweiler behaviour and its tests
stay byte-identical:

| Module | Rottweiler-specific today | Change |
| --- | --- | --- |
| `domain/hund.ts` | `hundKategorien`, `hundeBlockAuswahl`, `hundeUebersicht` use the fixed list; `hundUrl` base `/hunde`; `hundSeo` suffix "Rottweiler vom Luchberg." | Add `hundRegeln({ kategorien, listeUrl, seoSuffix, ohneGeschlecht })` returning `{ kategorieLabel, hundUrl, hundeUebersicht, hundeBlockAuswahl, geschlechtBadge, hundSeo }`. Existing exports become `hundRegeln(rottweiler)`-backed re-exports. `sortiereHunde`, `lebensspanne`, `lebensdatenKarte`, `geschlechter` stay as they are. |
| `domain/wurf.ts` | `wuerfeListeUrl` `/wuerfe`; `wurfSeo` "… vom Luchberg" (fits both) | `wurfUrlFuer(base)`; everything else reused unchanged. |
| `domain/seo.ts` | `headMeta` fallback name "Rottweiler vom Luchberg" | Fallback comes from the site config passed in (slice 0 probably does this anyway). |
| **new** `domain/dackel.ts` | – | `dackelKategorien`, `dackelFarben`, `dackelGroessen`, labels, `dackelSteckbrief(hund)` → list of `{ label, wert }` rows (Größe, Farbe, Wurftag, Brustumfang, Abstammung) skipping empty ones, `dackelHinweis` helpers. Pure, colocated tests. |

## 4. Design proposal

Rottweiler site for contrast: orange→pink gradients, neon glow, Bricolage Grotesque + Inter, large
rounded cards, white/peach backgrounds. The dachshund site must not read as a "colour scheme" of it.

### A – "Wiesenweg" (decided)

The photos are all green meadows, dandelions and warm wire-hair coats. A calm, editorial country
look: like a well-made farm journal.

- **Typography:** `@fontsource-variable/fraunces` (display; italic for emphasis, `SOFT` axis ~50 for
  friendliness) + `@fontsource-variable/source-sans-3` (body). Both self-hosted, OFL.
- **Tokens** (same semantic names as the Rottweiler site, so shared components keep working):

  | Token | Light | Dark |
  | --- | --- | --- |
  | `--bg` (paper) | `#f6f1e7` | `#14170f` |
  | `--surface` / `--surface-2` | `#ede5d4` / `#e2d7bf` | `#1d2117` / `#262b1e` |
  | `--fg` | `#23261c` | `#eee8d9` |
  | `--muted` | `#5e5a4b` | `#b0aa95` |
  | `--border` | `#d8ccb3` | `#343a2a` |
  | `--primary` / `--primary-ink` (meadow green) | `#3d5a2a` | `#a8c98a` |
  | `--accent` / `--accent-ink` (rust, the wild-boar coat) | `#a5481a` | `#e8935a` |
  | `--sun` (dandelion, decoration + button on dark only) | `#e8b923` | `#e8b923` |
  | `--dark` / `--on-dark` | `#24301d` / `#f6f1e7` | `#0c0e08` / `#eee8d9` |

  Contrast (WCAG, checked with a script): fg/bg 13.7 (dark 14.8), muted/bg 6.1 (7.8),
  primary/bg 6.9 (9.8), accent/bg 5.3 (7.6), accent on surface 4.7 (6.8), on-dark/dark 12.3 (15.9),
  dark text on `--sun` 7.5. All ≥ 4.5; `--sun` is never used as text on light backgrounds.
- **Layout:** generous whitespace, left-aligned editorial headings with a small uppercase rust
  "eyebrow" and a hand-drawn dandelion-yellow squiggle; photos in **arch frames** (rounded top,
  offset rust outline) – the arch is the recurring motif; the "long dog" **horizontal photo band**
  (scroll-snap) under the hero; values as three ruled columns (no cards); the Welpen block as one
  dark-green panel with a status pill; footer dark green with the Rottweiler hint as a dashed card.
- **Imagery:** real photos only, warm and natural, no filters, no gradients over photos. Faint paper
  grain on the background (CSS only). Placeholder logo = line-drawn dachshund silhouette in rust
  until Karo decides on a logo.
- **Motion:** small lift/tilt on dog cards, nothing else (no parallax, respects reduced motion).

### Dropped directions

B "Löwenzahn", C "Forsthaus", D "Bilderbuch", E "Lichtung", F "Dackelparade" (animated),
G "Leckerli-Suche" (game) and H "Schabernack" were built as mockups and shown to Karo. She chose A
and explicitly does not want animation, not even as an option. Their descriptions and mockups are
on the branch `claude/plan-01-dackel` (commit `67e5af4`).

## 5. Initial content (German, from Karo's existing text only)

Source: `src/content/hunde/rauhaardackel.md` and the old-site heading "Rauhaardackel aus Hobbyzucht"
(`migration/old-site-content.json`). Light proofreading only: "die Kleinen" capitalised, "Rat und
Tat" kept, "RHD" written out. TODO = needs Karo.

**Start (`/`)** – blocks: hero → photo band (galerie block, variant "band") → highlights → hunde
(kategorie zucht + deckrude) → wuerfe (status aktuell/geplant, otherwise CTA) → text (Über uns
teaser) → cta/kontakt.

- Hero kicker: "Standard-Rauhaardackel aus Sachsen". Titel: "Rauhaardackel, groß geworden mitten im
  Rudel." Untertitel: "Wir züchten unsere Rauhaardackel für Liebhaber und Familien und achten dabei
  auf Gesundheit und Wesen. Die Kleinen wachsen mit Familienanschluss bei uns auf und lernen alles
  Wichtige für ihren neuen Lebensweg." Buttons: "Welpen anfragen" → `/kontakt`, "Unsere Dackel
  kennenlernen" → `/unsere-dackel`.
- Highlights "Familienhunde mit Dackelkopf": *Gesundheit & Wesen* / *Aufgewachsen im Rudel* /
  *Jagdliche Wurzeln* (texts as in the mockup, each a paraphrase of one sentence of Karo's).
- Welpen teaser: "Ihr sucht einen Rauhaardackel? Bei Interesse an einem Dackel nehmen wir gern eure
  Anfrage entgegen und stehen euch mit Rat und Tat zur Seite." Status: TODO
  (next litter? none planned?).

**Unsere Dackel (`/unsere-dackel`)** – intro: "Zu unserem Rudel gehören unsere beiden
Rauhaardackel-Damen Hanni und Bonnie. Unsere Rauhaardackel sind absolute Familienhunde, gut
sozialisiert und erzogen. Sie dürfen oftmals als „Lehrhund“ auf dem Hundeplatz mithelfen – das
bereitet allen, vor allem den Kindern, große Freude."

- `hanni.md`, `bonnie.md`: rufname, geschlecht `huendin`, kategorie `zucht`, groesse `standard`.
  TODO: full name, Wurftag, Farbe, Abstammung, which photos show whom, a short text each.
- `vater.md` (title "Der Vater unserer Dackel", `auswaertig: true`, kategorie `deckrude`, bild
  `c3b66134-…jpg`). TODO: name, owner/kennel, may we name him?
- Bonnie appears in `karo-mit-dackel-und-junghund.jpg` (caption "Karo mit Bonnie und Baja").

**Welpen (`/welpen`)** – intro: "Unsere Standard-Rauhaardackel züchten wir ausschließlich für
Liebhaber und Familien. Auch die Kleinen wachsen mit Familienanschluss und im Rudel auf und lernen
alles Wichtige für ihren neuen Lebensweg kennen." Then the litter list; empty state: "Gerade sind
keine Welpen da. Ihr könnt euch aber jederzeit unverbindlich bei uns melden." TODO: past litters
(letters, dates, parents)? The puppy photos exist but are not assigned to a litter → keep them in a
gallery on this page until Karo assigns them.

**Über uns & Aufzucht (`/ueber-uns`)** – text: "Ich bin Karo und lebe mit meiner Familie und unserem
Rudel in Luchau, einem Ortsteil von Glashütte in Sachsen." (from the Rottweiler home page) + Karo's
paragraph on raising and hunting lineage: "Wir bilden unsere Dackelchen nicht zur Jagd aus, das heißt
allerdings nicht, dass sie das nicht dennoch können – die Elterntiere haben jagdliche Abstammungen."
TODO: how long has she bred dachshunds, what do puppies get when they move (Impfung, Chip,
Futter …), how does she choose new owners – only if she wants to write it.

**Kontakt** – Karo's sentence "Bei Interesse an einem Hund dieser Rasse nehmen wir gern Anfragen
entgegen und stehen auch hier mit Rat und Tat zur Seite." + form (Web3Forms, subject "Anfrage
Rauhaardackel") + address/phone from `dackelConfig` (assumption: same as Rottweiler, see Allgemein).

**Impressum / Datenschutz** – copied from the Rottweiler site once those are final; Datenschutz
mentions Cloudflare and Web3Forms (slice 3 owns the legal text per site).

## 6. Cross-links (D7)

**On the Rottweiler site**

- `/hunde/rauhaardackel` (`src/content/hunde/rauhaardackel.md`): shorten to the first sentence
  ("Zu unserem Rudel gehören auch unsere beiden Rauhaardackel-Damen Hanni und Bonnie.") + one line
  "Unsere Rauhaardackel haben jetzt ihre eigene Website: [Rauhaardackel vom Luchberg →](…)" and keep
  `bild` + 3 gallery photos. The breeding paragraph moves to the dachshund site (duplicate content on
  two domains would compete in Google). Karo's text is moved, not deleted.
- Footer: one line under the contact block, "Wir züchten auch Rauhaardackel → …", driven by a new
  optional config field `querverweis` (text + link) so Karo can change it and slice 2/3 can reuse it.
  Rendered only when set.
- The Rottweiler dogs list keeps the dachshund card in "Weitere Rudelmitglieder" (it is part of her
  pack); it links to the teaser page.
- Redirect `/weitere-rudelmitglieder/rauhaardackel → /hunde/rauhaardackel` stays. When the dachshund
  domain is live (slice 3), `/hunde/rauhaardackel` may become a 301 to it; then the old-site redirect
  must point straight to the new domain (avoid chains) – note for slice 3.

**On the dachshund site:** footer card "Auch bei uns: Wir züchten auch Rottweiler im ADRK →
Rottweiler vom Luchberg" (the ADRK claim is fine – it's the Rottweiler kennel's real membership).
No link in the main navigation.

The link target URL comes from config (`querverweis.link`), because the domains are not fixed yet
(`*.workers.dev` first).

## 7. Implementation tasks (commit-sized)

Prereq: slice 0 merged (SITE_ID, per-site routes/content/layout). Run after **every** task:
`npm test`, `npm run build:local` (for `SITE_ID=luchberg` **and** `SITE_ID=dackel`), `npx astro check`
(0/0). Rottweiler output must stay identical except where a task says otherwise (diff `dist/` of the
luchberg build before/after for tasks 1–3).

1. **Parameterise `hund` domain rules.** `src/lib/domain/hund.ts`: add `hundRegeln(config)`; current
   exports delegate to the Rottweiler config. Tests: existing `hund.test.ts` unchanged and green;
   new tests for a dachshund config (categories, URL base `/unsere-dackel`, SEO suffix, `ohneGeschlecht`).
2. **Parameterise `wurf` URL + `headMeta` fallback.** `wurf.ts` (`wurfUrlFuer`), `seo.ts`. Tests.
3. **`domain/dackel.ts`** + `dackel.test.ts`: categories, colours, sizes, labels, `dackelSteckbrief`.
4. **Tina collections.** Slice 0 PR B already ships `dackelPage` + `dackelConfig` (skeleton, in
   `tina/sites/dackel/{page,config}.ts`, factories in `tina/sites/collections.ts`, registered in
   `tina/schema.ts` and in `collections` of `src/sites/dackel/site.ts`). Add `tina/sites/dackel/{hund,wurf}.ts`
   and extend config/page, built from shared field
   factories (extract `hundBasisFelder`, `wurfBasisFelder` into `tina/collections/fields.ts` without
   changing the Rottweiler forms). Routers via `siteRouter('dackel', …)`; regenerate and commit
   `tina/tina-lock.json`. Verify in `npm run dev` that `/admin` shows "Dackel · …" collections and the
   Rottweiler forms are unchanged.
5. **Content.** `src/content/dackel/**`: config, pages (`home`, `unsere-dackel`, `welpen`, `ueber-uns`,
   `kontakt`, `impressum`, `datenschutz`), dogs (`hanni`, `bonnie`, `vater`), no litters yet. Copy (not
   move) photos to `public/uploads/dackel/` with readable names (`dackel-duo-bank.jpg`,
   `vater-steht-im-garten.jpg`, `welpe-mit-spielzeug-1.jpg` …) and alt texts. Never run
   `migration/migrate.py`.
6. **Design tokens + base layout.** `src/sites/dackel/styles/global.css` (slice 0 step 9, R7) (tokens light/dark, `@theme`,
   utilities `container-page`, `btn*`, `arch`, `eyebrow`, `squiggle`, `prose-dackel`), Fontsource
   deps `@fontsource-variable/fraunces`, `@fontsource-variable/source-sans-3`; `Header`, `Footer`
   (with cross-link card), `BaseHead` data (theme-color `#f6f1e7` / `#14170f`, favicon from the
   silhouette). Check 390 px / 1366 px, no horizontal overflow, light + dark.
7. **Block components (dachshund skin).** Reuse `Blocks.astro` dispatch; dachshund variants for Hero
   (arch image), Highlights (ruled columns), Galerie (`band` variant), Hunde/Wuerfe (arch cards +
   status pill), CTA/Kontakt. Shared logic stays in shared components; only markup/classes differ.
   Every editable element keeps `data-tina-field`.
8. **Detail pages + islands.** `HundBody`/`WurfBody` dachshund variants using `dackelSteckbrief`;
   `detailseiten` for the dackel site; routes `unsere-dackel/[slug]`, `welpen/[slug]`, `[slug]`,
   index. Verify live editing of a dog page in local mode.
9. **Contact form.** Reuse the form component; subject/sender name from `dackelConfig`; `mailto:`
   fallback verified.
10. **Rottweiler cross-link.** `querverweis` config field (Rottweiler config + footer line), shortened
    `src/content/hunde/rauhaardackel.md` (text moved per §6). Redirects in `astro.config.mjs`
    untouched; `npm run build:local` shows `/weitere-rudelmitglieder/rauhaardackel` still redirecting.
11. **Polish & review build.** Lighthouse (a11y ≥ 95, SEO 100) on Start + a dog page, alt texts, meta
    descriptions, sitemap contains only dackel URLs; deploy preview (`*.workers.dev`, slice 3) for Karo.

Tasks 1–3 can land before slice 0 (pure modules, no site wiring). 4–11 need slice 0.

## 8. Risks

| Risk | Mitigation |
| --- | --- |
| Club status unknown → wrong claims about papers/DTK | K5: neutral copy, club fields hidden; revisit after Karo's answer. |
| Thin content (2 dogs, no litter data) → weak SEO and "empty" feel | Strong Start page, photo band, honest empty states, breed-info page as follow-up once Karo writes something. |
| Duplicate text on both domains | Move the breeding paragraph to the dachshund site (§6). |
| Parameterising `hund`/`wurf` changes Rottweiler output | Existing tests untouched; diff luchberg `dist/` before/after tasks 1–3. |
| Tina codegen conflicts from new fields | Keep same-name-same-type across collections; no new block field names that clash (`text` stays string). |
| Two designs, shared components drift into `if (site === …)` soup | Shared components own data/logic, per-site components own markup; no site checks inside shared components. |
| Photo identity (who is Hanni/Bonnie) wrong | Mockup marks them "Foto?"; Karo assigns before content task 5 is finalised. |
| Karo changes her mind on the look once the real site is up | Tokens and the few dachshund block variants are the only design-specific code; the dropped directions are on `claude/plan-01-dackel`. |
