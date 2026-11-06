# Slice 2 – Content inventory "Alltag kann Sport"

Status: captured **2026-11-05** from the live Pfotentermin tenant (server-rendered HTML + embedded
RSC data). The live site is the source of truth. The Pfotentermin repo could **not** be read in
this session (attaching `tonimoeckel/pfotentermin` was denied), so seed/migration scripts were not
cross-checked. Everything below the "Texts" headings is copied **verbatim** (German, Karo's voice).
Remarks in *italics* are ours.

Tenant: alias `karolin-riesing`, tenant id `d7acd022-5563-42a9-a23f-c80096097a31`,
trainer id `14267504-3f8f-4251-8901-c48a5a668cfc`, theme `friendly-red` (`theme-color #dc2626`).

## 1. Live URLs

The tenant answers on **two URL forms** (both 200, no `rel=canonical`). The sitemap lists the
short form only.

| Page | Long form (`/s/karolin-riesing/…`) | Short form (subdomain root) | In sitemap |
| --- | --- | --- | --- |
| Start | `/s/karolin-riesing` | `/` | yes |
| Angebote | `/s/karolin-riesing/services` | `/services` | yes |
| Einzeltraining | `/s/karolin-riesing/services/bff4106e-9676-4b1c-adfb-7c3c4aefbdd3` | `/services/bff4106e-…` | no |
| Basistraining | `/s/karolin-riesing/services/670bef78-8545-4fa8-8c5d-3b0e7a785dbf` | `/services/670bef78-…` | no |
| Welpenkurs | `/s/karolin-riesing/services/20d50494-4833-4805-be2e-f82d2d57b30c` | `/services/20d50494-…` | no |
| Über mich | `/s/karolin-riesing/ueber-uns` | `/ueber-uns` | yes |
| Bewertungen | `/s/karolin-riesing/bewertungen` | `/bewertungen` | yes (*empty, 0 reviews*) |
| Buchen | `/s/karolin-riesing/book` (+ `?step=…&service=…`) | `/book` | no (robots: disallowed) |
| Impressum / Datenschutz / AGB / Kontakt | `/impressum`, `/datenschutz`, `/agb`, `/s/karolin-riesing/kontakt` | – | **all 404** |

*The tenant has no legal pages of its own; the footer links point to 404s. The new site needs its
own Impressum and Datenschutz anyway.*

## 2. Global / settings

| Field | Value |
| --- | --- |
| Site name | Alltag kann Sport |
| `<title>` start | Alltag kann Sport - Hundetraining online buchen |
| `<title>` services | Unsere Angebote - Alltag kann Sport |
| `<title>` about | Über mich - Alltag kann Sport |
| Meta / OG description | Hundetraining für echte Alltagssituationen. |
| OG image | `favicon.png` (512×512) |
| Primary CTA label | Termin buchen |
| Trainer | Karolin Riesing |
| E-mail (trainer) | `bruosdonnalina2018@gmail.com` |
| Phone | – (not set on Pfotentermin; Rottweiler site has `0173 3665494`) |
| Instagram | `https://www.instagram.com/karoriesing_caninepure` |
| Website (trainer social link) | `https://www.vomluchberg.de` |
| Location | "Trainingsgelände Glashütte", Dorfstr. 2d, 01768 Glashütte – "Im Herzen des Osterzgebirges" |
| Location per offer | "Wird bei Buchung bekannt gegeben" (no coordinates) |
| Navigation | Start · Über mich · Buchen · Services · [Termin buchen] |
| Footer | Navigation (Start, Über mich, Buchen, Services) · Rechtliches (Impressum, Datenschutz, AGB) · "© 2026 Alltag kann Sport. Alle Rechte vorbehalten." · "Powered by Pfotentermin" |

## 3. Start page – texts

**Hero**

- Headline: **Sport & Alltag mit Hund**
- Subline: **Hundetraining für echte Alltagssituationen.**
- Hero logo: `hero-dark-logo.png`, hero photo: `background.jpg`

**Trainer card**

- Kicker: Dein Trainer
- Name: Karolin Riesing
- Bio: Hundetrainerin mit Fokus auf alltagstaugliche Erziehung und sportliche Übungen für Fokus und
  Bindung. Karolin arbeitet in kleinen Gruppen und bietet individuelles Training – klar, fair und
  verständlich.
- Price teaser: Einzeltraining ab **50 € /Termin** · Button: Jetzt Termin buchen
- Badges: Bei Hunden beliebt · Individuelle Betreuung · **5.0 Bewertung** · Flexible Termine

*"5.0 Bewertung" and "Bei Hunden beliebt" are Pfotentermin template badges: the tenant has
**0 reviews** (`reviewCount: 0`). Do not carry them over.*

**Angebote section**

- Headline: Unsere Angebote
- Intro: Entdecke unsere Trainingsangebote — von individueller Einzelbetreuung bis hin zu
  Gruppenkursen mit festen Terminen.
- Cards: see §5. Group courses show "Aktuell sind keine Termine geplant. Schreib uns an — wir
  melden uns mit neuen Terminen."

**Trainer specialisations** (tags shown on every offer detail page): Alltagstraining · Hundesport ·
Impulskontrolle · Leinenführigkeit

## 4. Angebote overview – texts

- Back link: Zurück zur Startseite
- Headline: **Meine Angebote**
- Intro: Entdecke das passende Training für dich und deinen Hund. Von Einzelcoachings bis zu
  Gruppenkursen – wir haben für jede Herausforderung die richtige Lösung.
- Filter: Format (Alle · Online · Vor Ort) – *no online offers, drop*
- Booking wizard (`/book`) category texts: "Was möchtest du buchen?" – Einzeltraining: *Individuelles
  Training für Alltag und Sport* · Basistraining: *Gruppenkurse für Grundgehorsam* · Welpenkurs:
  *Spielerische Sozialisation und erste Grundlagen für junge Hunde*

## 5. Offers

All offers: trainer Karolin Riesing, **vor Ort** (not online), 45 min, treffpunkt "Wird bei Buchung
bekannt gegeben", no package/discount, no fixed dates currently scheduled.

### 5.1 Einzeltraining

| Field | Value |
| --- | --- |
| Category | Einzeltraining (icon 🎯, sort 1) |
| Title | Einzeltraining |
| Short description | Individuelles Training für Alltag, Verhalten oder sportliche Entwicklung – aktuell nur auf Anfrage / Absprache. |
| Description | Einzeltermine biete ich aktuell nur nach persönlicher Absprache an. Schreib mir gern eine Nachricht — wir schauen gemeinsam, was du und dein Hund braucht, und finden einen passenden Termin. |
| Duration | 45 Min. |
| Price | 50,00 € / Termin |
| Participants | 1 (Einzeltraining) |
| Booking type | flexible, **onRequest: true** → button "Termin anfragen" |
| About-page CTA text | Aktuell nur auf Anfrage / Absprache – schreib mir gern eine Nachricht. |
| Images | `angebote/einzeltraining-1.jpg` (card + detail), `-2.jpg`, `-3.jpg` (detail gallery) |

### 5.2 Basistraining – Hör auf damit, mach was mir gefällt

| Field | Value |
| --- | --- |
| Category | Basistraining (icon 📚, sort 2) |
| Title | Basistraining – Hör auf damit, mach was mir gefällt |
| Short description | Der Einstiegskurs für alle Hundehalter, die ihren Hund besser verstehen und im Alltag sicher führen möchten. |
| Description | Orientierung am Menschen, Sitz/Platz/Steh, Leinenführigkeit, Impulskontrolle und erste sportliche Übungen. 4 Termine, max. 4 Hunde. |
| Duration | 45 Min. per Termin (detail page shows a 4-day schedule "Tag 1–4, 10:00 – 11:00 (45 Min)") |
| Price | 25,00 € / Termin |
| Participants | "Gruppe · bis zu 6 Hunde" (`maxParticipants: 6`) |
| Booking type | scheduled, onRequest: false – no dates planned |
| About-page CTA text | Gruppenkurs für Alltag und Grundgehorsam – bis zu 6 Hunde. |
| Images | `hundesport/fussarbeit-hundeplatz.jpg` (card, 4:3 crop on Pfotentermin), `hundesport/training-hundeplatz.jpg`, `hundesport/drei-rottweiler-platz.jpg` (detail gallery) |

*Conflicts to clear with Karo: description says **max. 4 Hunde**, the data says **bis zu 6**. "4
Termine × 25 €" – is the course price 100 € or per session? "10:00 – 11:00" vs "45 Min".*

### 5.3 Welpenkurs

| Field | Value |
| --- | --- |
| Category | Welpenkurs (icon 🐶, sort 3) |
| Title | Welpenkurs |
| Short description | Welpenkurs: Bindung, Sozialisierung und erste sportliche Übungen. |
| Description | Ein guter Start fürs ganze Hundeleben. Der Welpenkurs vermittelt von Anfang an die Basis: eine echte Bindung zwischen dir und deinem Hund, die Souveränität im Alltag und das Selbstvertrauen, das junge Hunde brauchen, um die Welt kennenzulernen. |
| Duration | 45 Min. |
| Price | 25,00 € / Termin |
| Participants | Gruppe · bis zu 6 Hunde (about page: "bis zu 6 Welpen") |
| Booking type | scheduled, onRequest: false – no dates planned |
| **Das solltest du mitbringen** | Gut sitzendes Brustgeschirr · Leichte Führleine 1,5–2 m (keine Flexi) · Weiche Leckerlies in 2 Sorten · Lieblingsspielzeug · Decke oder Matte für Ruhepausen · Wasser und Kotbeutel · Impfausweis (zur 1. Einheit) |
| About-page CTA text | Spielerische Sozialisation für junge Hunde – bis zu 6 Welpen. |
| Images | `angebote/welpenkurs-rottweilerwelpe.jpg` |

*Missing: puppy age range, number of sessions.*

## 6. Über mich page – texts

Hard-coded custom page (`KarolinRiesingAboutPage.tsx` in Pfotentermin).

**Hero**: Kicker "Glashütte, Sachsen" · **Karolin Riesing** · Hundetrainerin mit Herz und Erfahrung ·
Badge "Alltag kann Sport"

**Über mich – Mein Weg zur Hundetrainerin**

> Meine Leidenschaft für Tiere begleitet mich schon mein ganzes Leben. Aufgewachsen auf einem
> Bauernhof, war der tägliche Umgang mit Tieren für mich selbstverständlich und prägend. Schon früh
> entwickelte ich ein tiefes Verständnis für Verhalten, Kommunikation und Bedürfnisse unserer
> tierischen Begleiter.
>
> Vor meiner intensiven Arbeit mit Hunden war ich viele Jahre im Pferdesport aktiv. Dort habe ich
> gelernt, wie wichtig Vertrauen, klare Kommunikation und eine faire Ausbildung sind – Werte, die
> heute die Grundlage meines Hundetrainings bilden.
>
> Seit 2018 bin ich aktiv im Hundesport tätig und engagiere mich seit 2019 als Übungsleiterin im
> Hundesportverein. In dieser Zeit durfte ich zahlreiche Mensch-Hund-Teams auf ihrem Weg begleiten
> und individuell fördern.

**Vita timeline**

| When | Title |
| --- | --- |
| Kindheit | Aufgewachsen auf dem Bauernhof |
| Seit 2018 | Aktiv im Hundesport |
| Seit 2019 | Übungsleiterin im Verein |
| Seit 2021 | ADRK Rottweilerzüchterin |

**Meine Philosophie – Klar, fair und verständlich**

| Value | Text |
| --- | --- |
| Vertrauen | Als Basis für alles |
| Klarheit | In der Kommunikation |
| Fairness | Im Umgang miteinander |
| Verständnis | Für jedes Team |

Quote: „Ich möchte Menschen dabei unterstützen, ihre Hunde besser zu verstehen und eine klare,
faire und vertrauensvolle Beziehung aufzubauen – egal ob im Alltag oder im Sport.“ — Karolin Riesing

**Qualifikationen – Fundierte Ausbildung & Erfahrung**

Intro: Meine fachliche Qualifikation basiert auf einer fundierten Grund-, Basis- und
fachspezifischen Ausbildung im Hundesportverein, die einer Trainer-C-Lizenz gleichwertig ist.

| Title | Text |
| --- | --- |
| Trainer-C-Lizenz (gleichwertig) | Fundierte Grund-, Basis- und fachspezifische Ausbildung im Hundesportverein |
| Genehmigung nach §11 TSchG | Behördliche Genehmigung für gewerbliches Hundetraining |
| FCI Prüfungen | Von der Begleithundeprüfung bis zur höchsten Klasse im Gebrauchshundesport |
| Fährtenarbeit | Erfolgreich absolvierte Fährtenprüfungen nach FCI |
| Übungsleiterin seit 2019 | Aktive Begleitung zahlreicher Mensch-Hund-Teams im Hundesportverein |
| ADRK Züchterin seit 2021 | Anerkannte Rottweiler-Zucht unter dem Dach des VDH |

**Hundesport – Sportliche Leidenschaft & Leistung**

> Meine eigene sportliche Laufbahn umfasst mehrere erfolgreich abgelegte Prüfungen nach der
> internationalen Prüfungsordnung der Fédération Cynologique Internationale (FCI) – von der
> Begleithundeprüfung bis hin zur höchsten Klasse im Gebrauchshundesport.
>
> Auch im Bereich der Fährtenarbeit konnte ich wertvolle Erfahrung durch absolvierte Prüfungen
> sammeln. Diese sportliche Erfahrung fließt direkt in mein Training ein und hilft mir, auch
> ambitionierte Teams optimal zu fördern.

Tags: Begleithundeprüfung (BH) · IGP (höchste Klasse) · Fährtenarbeit · Gebrauchshundesport ·
Unterordnung · Schutzdienst · Begleithundetraining · Apportierarbeit

**Rottweiler-Zucht – Zwinger „vom Luchberg“**

> Seit 2021 bin ich zudem Züchterin von Rottweilern im Allgemeiner Deutscher Rottweiler-Klub (ADRK)
> unter dem Dach des Verband für das Deutsche Hundewesen (VDH).
>
> Hier lege ich besonderen Wert auf Gesundheit, Wesen und Leistungsfähigkeit – sowohl im Alltag als
> auch im Sport. Meine langjährige Erfahrung im Hundesport und meine Arbeit als Trainerin fließen
> direkt in die Aufzucht und Sozialisierung meiner Welpen ein.

Tags: Gesundheit · Wesen · Leistungsfähigkeit · ADRK · VDH · Link „vomluchberg.de besuchen“

*Grammar as live ("im Allgemeiner Deutscher Rottweiler-Klub", "unter dem Dach des Verband für…").
Suggest to Karo: "im Allgemeinen Deutschen Rottweiler-Klub … des Verbands für das Deutsche
Hundewesen" – don't change silently.*

**Ernährungsberatung – Canine Pure**

> Neben dem Hundetraining biete ich ganzheitliche Ernährungsberatung für Hunde an. Durch meine
> Erfahrung als Züchterin und Trainerin weiß ich, wie entscheidend die richtige Ernährung für
> Gesundheit, Leistung und Wohlbefinden ist.
>
> Ganzheitliche Gesundheit besteht aus mehreren Faktoren: ausgewogene Ernährung, regelmäßige
> Bewegung und achtsame Pflege bilden die Grundlage für ein glückliches und gesundes Hundeleben.

Tags: Natürliche Ernährung · Individuelle Beratung · Prävention · Ganzheitlicher Ansatz · Link
„caninepure.de besuchen“ (`https://www.caninepure.de`)

**Mein Rudel – Meine Hunde**

Intro: Aktuell begleiten mich sechs Hunde – jeder mit seinem eigenen Charakter, seinen Stärken und
seiner Geschichte.

| Name | Rasse | Label |
| --- | --- | --- |
| Donna | Rottweiler | Die Erste |
| Aaron | Rottweiler | Donnas Sohn |
| Baja | Rottweiler | Donnas Tochter |
| Isko | Dt. Schäferhund | Vielseitig |
| Hanni | Dackel | Klein & fein |
| Bonnie | Dackel | Klein & fein |

*Outdated: on the Rottweiler site Donna is "In Erinnerung", and there are more dogs (Duffy, Harley,
Hunter …). Proposal: don't keep a second dog list on the training site; link to
`vomluchberg.de/hunde` instead (question for Karo).*

**Standort – Hier findest du mich**: Trainingsgelände Glashütte · Dorfstr. 2d · 01768 Glashütte ·
Im Herzen des Osterzgebirges, umgeben von Natur – der perfekte Ort für entspanntes Training mit
deinem Hund. · Link „In Google Maps öffnen“ (`https://maps.google.com/?q=Dorfstr.+2d,+01768+Glash%C3%BCtte`)
· Glashütte · Osterzgebirge, Sachsen

**Bereit loszulegen?** Ob Einzeltraining, Gruppenkurs oder Seminar – finde das passende Angebot für
dich und deinen Hund. (3 offer teasers, see §5) · Button: Jetzt Termin buchen

*"Seminar" – there is no seminar offer. Drop or ask.*

## 7. Contact details & legal

- Contact form: none (Pfotentermin booking only). E-mail as above.
- Impressum / Datenschutz / AGB: **no tenant-specific pages** (404). Pfotentermin platform AGB/legal
  don't transfer. The new site needs: Impressum (§ 5 DDG; reuse Karo's data from
  `src/content/seiten/impressum.md`, plus the § 11 TSchG authority if Karo wants to show it) and a
  Datenschutzerklärung (Cloudflare hosting, Web3Forms, no cookies/tracking, Instagram link only).
- Reviews: none.

## 8. Images

Downloaded on 2026-11-05 into `public/uploads/training/` with `scripts/import-images.mjs`
(EXIF-oriented, ≤ 1600 px, metadata stripped, JPEG q82). Logos copied unchanged as PNG.
Base URL `S = https://oyjkftoytpztcyvbfbbs.supabase.co/storage/v1/object/public`,
`T = d7acd022-5563-42a9-a23f-c80096097a31` (tenant), `K = 14267504-3f8f-4251-8901-c48a5a668cfc` (trainer).
"Caption" is the stored gallery caption, "alt" what the about page renders (they were assigned
independently and partly don't match the picture). "Proposed alt" is what the new site should use.

| # | Target (`public/uploads/training/…`) | Size | Source | Used on Pfotentermin | Caption / alt there | Proposed alt |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `logo/logo.png` | 332×200 PNG | `S/tenant-logos/tenants/T/hero-dark-logo.png` | Start hero | alt "Alltag kann Sport" | Karolin Riesing – Alltag kann Sport |
| 2 | `logo/logo-hell.png` | 332×200 PNG | `…/T/hero-light-logo.png` | (dark mode) | – | (same) |
| 3 | `logo/logo-klein.png` | 83×50 PNG | `…/T/nav-dark-logo.png` | Header | alt "Alltag kann Sport Logo" | – (replace by `logo.png` scaled) |
| 4 | `logo/logo-klein-hell.png` | 83×50 PNG | `…/T/nav-light-logo.png` | Header (dark) | – | – |
| 5 | `logo/favicon.png` | 512×512 PNG | `…/T/favicon.png` | Favicon, OG image | – | – |
| 6 | `start/spaziergang-feldweg.jpg` | 1600×1065 | `S/tenant-backgrounds/tenants/T/background.jpg` (identical to gallery `…/1774135011667.webp`, not stored twice) | Start hero photo; about gallery #3 | caption "Gemeinsam unterwegs – Training im Alltag", alt "Karolin beim Training mit ihren Hunden" | Karolin geht mit Rottweiler und Dackel an lockerer Leine einen Feldweg entlang |
| 7 | `karolin/karolin-mit-dackel-und-rottweiler.jpg` | 1080×1080 | `S/trainer-photos/trainers/K/profile.webp` | Trainer card, offer detail pages | alt "Karolin Riesing" | Karolin Riesing mit Dackel und Rottweiler |
| 8 | `karolin/karolin-mit-hunden-wiese.jpg` | 1600×900 | `S/trainer-gallery/trainers/K/gallery/1774135009149.webp` | About hero | caption "Karolin mit ihren Hunden in der Natur", alt "Karolin Riesing mit ihren Hunden" | Karolin hockt mit Dackel und Rottweiler auf einer Frühlingswiese |
| 9 | `karolin/karolin-mit-rottweiler-sitzend.jpg` | 1200×800 | `…/gallery/1774135010460.webp` | About | caption "Karolin und Donna – ein starkes Team", alt "Karolin Riesing mit ihrem Rottweiler" | Karolin sitzt mit ihrem Rottweiler im Gras *(Karo: ist das Donna?)* |
| 10 | `karolin/karolin-portrait-birken.jpg` | 1200×800 | `…/gallery/1774135012671.webp` | About (breeding section) | caption "Karolin mit ihren Rottweilern", alt "Karolin mit ihren Rottweilern – Zucht vom Luchberg" | Porträt Karolin Riesing zwischen Birken |
| 11 | `karolin/karolin-portrait-baum.jpg` | 1200×800 | `…/gallery/1774135014946.webp` | About | caption "Fußarbeit – klare Kommunikation in Bewegung", alt "Fußarbeit beim Hundesport" | Porträt Karolin Riesing unter einem Baum |
| 12 | `karolin/karolin-mit-junghund.jpg` | 1200×800 | `…/gallery/1774135019851.webp` | About (nutrition section) | caption "Karolin und ihr Rottweiler – Vertrauen und Bindung", alt "Karolin – Ernährungsberatung für Hunde" | Karolin hockt neben einem jungen Rottweiler |
| 13 | `hundesport/drei-rottweiler-platz.jpg` | 1200×800 | `…/gallery/1774135013803.webp` (≈ service image `S/service-images/services/670bef78-…/1774130408404.webp`, 4:3 crop, not stored) | About; Basistraining detail | caption "Rottweiler-Zucht vom Luchberg", alt "Karolin mit drei Rottweilern auf dem Trainingsgelände" | Drei Rottweiler liegen im Platz neben Karolin |
| 14 | `hundesport/fussarbeit-hundeplatz.jpg` | 1200×800 | `…/gallery/1774135016371.webp` (≈ `670bef78-…/1774130405594.webp`, not stored) | About; Basistraining card + detail | caption "Training auf dem Hundeplatz", alt "Training auf dem Hundeplatz" | Karolin bei der Fußarbeit mit ihrem Rottweiler auf dem Hundeplatz |
| 15 | `hundesport/training-hundeplatz.jpg` | 1200×800 | `…/gallery/1774135017857.webp` (≈ `670bef78-…/1774130407065.webp`, not stored) | About; Basistraining detail | caption "Begleithundetraining im Hundesport", alt "Begleithundetraining" | Karolin führt ihren Hund bei einer Prüfung auf dem Hundeplatz |
| 16 | `hundesport/apportieren-wiese.jpg` | 1200×800 | `…/gallery/1774135018863.webp` | About | caption "Apportierarbeit – Teamwork in Aktion", alt "Apportierarbeit" | Rottweiler läuft über die Wiese zu den Apportierhölzern |
| 17 | `angebote/einzeltraining-1.jpg` | 1200×900 | `S/service-images/services/bff4106e-9676-4b1c-adfb-7c3c4aefbdd3/1774130400028.webp` | Einzeltraining card + detail | alt "Einzeltraining" | Karolin sitzt mit ihrem Rottweiler auf der Wiese |
| 18 | `angebote/einzeltraining-2.jpg` | 1200×900 | `…/bff4106e-…/1774130401323.webp` | Einzeltraining detail | – | Karolin hockt neben einem jungen Rottweiler |
| 19 | `angebote/einzeltraining-3.jpg` | 900×1200 | `…/bff4106e-…/1774130403323.webp` (**stored sideways on Pfotentermin**, rotated 90° here) | Einzeltraining detail | – | Karolin umarmt ihren Rottweiler |
| 20 | `angebote/welpenkurs-rottweilerwelpe.jpg` | 1200×900 | `S/service-images/services/20d50494-4833-4805-be2e-f82d2d57b30c/1778795763734.webp` | Welpenkurs card + detail | alt "Welpenkurs" | Rottweilerwelpe mit pinkem Halsband schaut nach oben |

Notes:

- 23 source files → 20 files in the repo (1 exact duplicate, 3 near-duplicate 4:3 crops dropped;
  `object-fit: cover` handles the crop). Total 1.9 MB.
- Logos are only 332×200 px raster. For a crisp header and a proper favicon set Toni needs the
  original/vector logo from Karo (or her designer). Colours sampled from the logo: navy `#193450`,
  copper `#b96637`, mist blue `#c8d9e8` (favicon background).
- The original folder `tmp/Bilder für Hundetrainer HP` (Pfotentermin, not in git) may contain
  higher-resolution originals; Supabase only has ≤ 1920 px WebP. Good enough for the site.
- No re-runnable fetch script was added: it's a one-off import (D10), the URLs are listed above,
  and the existing `scripts/import-images.mjs` did the resizing with a manifest kept in the session
  scratchpad. To repeat: download the URLs above and feed them to `import-images.mjs`.
