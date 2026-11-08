# Domains für die Dackel- und die Trainingsseite

Checkliste für Karo und Toni. Sie funktioniert wie der [Domain-Umzug von vomluchberg.de](domain-umzug.md),
nur einfacher: Die neuen Domains werden **neu bestellt**, es gibt keinen alten Provider und keinen
Übernahmecode. Die technischen Details stehen in [`plan/03-betrieb.md`](plan/03-betrieb.md).

**Ziel:** Die Domains gehören Karo (eigener Registrar-Account, sie zahlt selbst). Das DNS läuft über
Cloudflare (kostenlos), die Websites laufen über Cloudflare Workers, genau wie bei `vomluchberg.de`.

| Seite | Domain | Stand |
| --- | --- | --- |
| Hundetraining | **`alltag-kann-sport.de`**, dazu `alltagkannsport.de` und `hundetraining-osterzgebirge.de` als Weiterleitung | **bestellt am 08.11.2026** bei INWX, Nameserver Cloudflare (`sean`/`sloan.ns.cloudflare.com`), Zonen angelegt |
| Rauhaardackel | **`dackelvomluchberg.de`** | **bestellt am 08.11.2026** bei INWX, Nameserver Cloudflare (`sean`/`sloan.ns.cloudflare.com`), Zone angelegt |

Bis zum Start laufen die Seiten unter `dackel.vomluchberg.de` und `training.vomluchberg.de`. Danach leiten diese
Testadressen auf die neuen Domains weiter.

Die Adresse wird immer mit **www** genutzt (z. B. `www.alltag-kann-sport.de`). Wer die Adresse ohne www
eintippt, landet automatisch auch dort.

## Domain für die Trainingsseite – Vorschläge

Stand: **08.11.2026, 17:18–17:20 Uhr** (DENIC-RDAP für `.de`, Verisign-RDAP für `.com`, Identity-Digital-RDAP
für `.dog`). „Frei“ heißt: zu diesem Zeitpunkt nicht registriert. Bitte direkt vor der Bestellung noch
einmal prüfen.

### Kandidaten

| Domain | Frei? | Vorteile | Nachteile |
| --- | --- | --- | --- |
| **`alltag-kann-sport.de`** | ja | Euer Markenname, passt zu Seitentitel, Logo-Claim und den Pfotentermin-Links. Gut lesbar auf Flyern. Sagt „Sport“, also Hund + Bewegung, ohne an einen Ort gebunden zu sein. | Zwei Bindestriche, am Telefon umständlich („Alltag Bindestrich kann …“). Hängt am Markennamen: Ändert ihr den, muss die Domain mit. |
| `alltagkannsport.de` | ja | Ohne Bindestriche leicht zu diktieren („alles zusammen“). | Schlechter lesbar (`alltagkannsport`), auf Flyern wirkt es wie ein Wort. |
| `karolin-riesing.de` | ja | Dein Name, passt zum Logo („Karolin Riesing“), bleibt auch bei neuem Markennamen, Seminaren oder anderen Orten richtig. | Sagt nicht, worum es geht. „Riesing“ wird leicht falsch geschrieben (Riesling, Rießing), muss oft buchstabiert werden. |
| `karolinriesing.de` | ja | wie oben, ohne Bindestrich | wie oben |
| `karo-riesing.de`, `karoriesing.de` | ja | kurz, so wie dich viele nennen | Spitzname, wirkt weniger professionell; gleiches Rechtschreib-Risiko |
| `hundetraining-riesing.de` | ja | Leistung + Name, auch ohne Markennamen verständlich | lang, „Riesing“ wie oben, kein Bezug zu „Alltag kann Sport“ |
| `riesing-hundetraining.de` | ja | wie oben | wie oben |
| `hundetraining-karolin-riesing.de` | ja | eindeutig | sehr lang (32 Zeichen), drei Bindestriche |
| `hundetraining-glashuette.de` | ja | Ort + Leistung, spricht lokale Suchen an | „ue“ statt „ü“ (Tippfehler), bindet an Glashütte; Kunden aus Dresden fühlen sich weniger gemeint. Der Ort in der Domain bringt bei Google heute kaum noch etwas. |
| `hundetraining-glashütte.de` | ja | wie oben, mit echtem Umlaut | Umlaut-Domains machen in E-Mails, auf manchen Handys und in Formularen Ärger. Nicht empfohlen. |
| `hundetraining-osterzgebirge.de` | ja | ganze Region | lang, klingt nach Verzeichnis/Portal, nicht nach dir; Verwechslung mit dem Hundesportverein möglich (Karo, 08.11.2026) |
| `hundeschule-osterzgebirge.de`, `hundeschule-glashuette.de` | ja | wie oben | „Hundeschule“ passt nicht ganz (Training nur auf Anfrage, kein fester Schulbetrieb); klingt nach Portal |
| `hundetraining-luchau.de` | ja | sehr lokal | „Luchau“ kennt außerhalb kaum jemand |
| `hundetraining-vom-luchberg.de`, `training-vom-luchberg.de`, `luchberg-training.de`, `hundetraining-luchberg.de` | ja | Familienname mit der Zucht | Verwechslung mit der Rottweiler-Zucht; das Training ist für alle Rassen |
| `alltag-und-sport.de`, `sport-und-alltag-mit-hund.de` | ja | nimmt den Hero-Satz „Sport & Alltag mit Hund“ auf | weicht vom Markennamen ab, Verwechslungsgefahr |
| `alltag-kann-sport-hundetraining.de`, `hundetraining-alltag-kann-sport.de` | ja | Marke + Leistung | zu lang |
| `hund-kann-sport.de`, `hundkannsport.de` | ja | kurz, nah an der Marke, mit „Hund“ | weicht vom Markennamen ab; „Hund“ in der Domain bringt bei Google kaum etwas |
| `hund-alltag-sport.de` | ja | mit „Hund“ | wie oben, etwas holprig |
| `hundetraining-erzgebirge.de` | **nein** (vergeben) | – | – |
| `alltagkannsport.com`, `karolinriesing.com` | ja | – | Für eine Kundschaft in Sachsen unnötig; `.de` reicht. |
| `alltagkannsport.dog`, `alltag-kann-sport.dog`, `karolinriesing.dog` | ja | witzig | Kaum bekannt, wird oft für einen Tippfehler gehalten, teurer als `.de`. Nicht nötig. |

### Was wir sonst geprüft haben (keine Rechtsberatung)

- **Gleichnamige Hundeschulen:** Bei einer kurzen Web-Suche (08.11.2026) haben wir keine Hundeschule und
  keine andere Firma gefunden, die „Alltag kann Sport“ heißt. In Glashütte, Dippoldiswalde und Altenberg
  haben wir keine Hundeschule mit ähnlichem Namen gefunden (nur z. B. den Hundesportclub Dippoldiswalde
  e. V.). Eine Hundeschule in Österreich wirbt mit „Alltag, Sport, Fitness“, das ist ein anderer Name und
  eine andere Region.
- **Marken:** Die Web-Suche fand keine eingetragene Marke „Alltag kann Sport“. Das Register des DPMA
  (`register.dpma.de`) und TMview (`tmdn.org/tmview`, auch EU-Marken) ließen sich von hier aus nicht
  automatisch abfragen. **Toni prüft das vor der Bestellung einmal von Hand** (Suche nach „Alltag kann
  Sport“ in beiden Registern, ca. 5 Minuten). Ein Treffer in den Klassen 41 (Ausbildung, Sport) oder 31/44
  (Tiere) wäre ein Grund, noch einmal zu sprechen.

### Empfehlung

> **Stand 08.11.2026:** Bestellt sind `alltag-kann-sport.de` (Hauptadresse), `alltagkannsport.de` und
> `hundetraining-osterzgebirge.de` (beide nur Weiterleitung), je 5,49 € im Jahr bei INWX. Offen ist nur,
> welche Schreibweise auf Flyern steht (Annahme: mit Bindestrichen).

**Hauptadresse: `www.alltag-kann-sport.de`.** Dazu **`alltagkannsport.de`** als Weiterleitung.

Warum: Der Name ist eure Marke, er steht schon im Seitentitel und bei Pfotentermin, und er bindet euch an
keinen Ort. Auf Flyern und Visitenkarten ist die Schreibweise mit Bindestrichen am besten lesbar. Mit der
zweiten Domain ohne Bindestriche ist das Diktieren kein Problem mehr: Egal, ob jemand die Bindestriche
mittippt oder nicht, er landet richtig. Am Telefon reicht dann „alltag kann sport punkt de, alles
zusammen“.

Ein Ort in der Domain lohnt sich nicht: Bei Google zählen für „Hundetraining Glashütte“ vor allem das
**Google-Unternehmensprofil** und die Ortsnamen in den Texten der Seite (beides ist geplant), nicht die
Domain.

**Alternativen:**

1. **`www.karolin-riesing.de`**, falls du den Namen „Alltag kann Sport“ nicht behalten möchtest. Dein Name
   passt zu jedem späteren Angebot (Seminare, Ernährungsberatung, andere Orte). Dann wäre
   `karolinriesing.de` die Weiterleitung.
2. **`www.hundetraining-riesing.de`**, falls du Name und Leistung in der Adresse haben möchtest. Länger,
   aber ohne Erklärung verständlich.

### Lohnt sich zusätzlich der Personenname?

**Ja, als Weiterleitung, wenn es dir die paar Euro im Jahr wert ist.** `karolin-riesing.de` ist frei. Wer
nach deinem Namen sucht oder ihn vom Logo abtippt, landet so auf der Trainingsseite. Und solltest du den
Markennamen später ändern, ist der Name schon gesichert. Nötig ist es nicht: Die Seite wird bei Google auch
so unter deinem Namen gefunden.

Damit wären es für das Training bis zu drei Domains: `alltag-kann-sport.de` (Hauptadresse),
`alltagkannsport.de` (empfohlen) und `karolin-riesing.de` (optional). Die zwei Weiterleitungen richtet Toni
in Cloudflare mit einer Weiterleitung (301) auf `https://www.alltag-kann-sport.de` ein; an der Website
selbst ändert sich dafür nichts.

### Damit Google die Seite gut findet (SEO)

Die Domain allein macht bei Google wenig aus. Wichtig ist, dass alle Adressen sauber auf **eine**
Hauptadresse zeigen und dass Google dich als Hundetrainerin in Glashütte erkennt. Darauf achten wir:

- **Nur eine Adresse zeigt die Seite:** `https://www.alltag-kann-sport.de`. Alles andere leitet
  dauerhaft (301) dorthin weiter, und zwar auf dieselbe Unterseite, nicht nur auf die Startseite: die
  Adresse ohne www, `alltagkannsport.de`, `karolin-riesing.de`, `training.vomluchberg.de` und die alten
  Pfotentermin-Links. Weiterleitungs-Domains zeigen nie selbst die Seite, sonst sieht Google doppelte
  Inhalte. Die Seite setzt auf jeder Unterseite einen Canonical-Link auf die www-Adresse (`SITE_URL`).
- **Pfotentermin weiterleiten, nicht abschalten:** Die alten Links (`karolin-riesing.pfotentermin.eu`,
  `/services/…`) bringen ihre Bekanntheit bei Google über die 301 auf die neuen Unterseiten
  (`/angebote/…`, `/ueber-mich`) mit. Die Weiterleitung bleibt mindestens ein Jahr, am besten für immer
  (siehe Abschnitt 6).
- **Testadresse:** `training.vomluchberg.de` bleibt bis zum Start auf `noindex`, damit Google sie nicht
  als eigene Seite aufnimmt. Danach leitet sie weiter.
- **Hauptadresse nicht mehr wechseln:** Jeder Domainwechsel kostet bei Google für einige Wochen
  Sichtbarkeit. Deshalb lieber jetzt in Ruhe entscheiden (darum auch die Frage nach dem Markennamen).
- **Google-Unternehmensprofil** (der größte Hebel für „Hundetraining Glashütte“ oder „Hundetrainer
  Osterzgebirge“): Kategorie „Hundetrainer“, als Website `https://www.alltag-kann-sport.de` eintragen.
  Name, Adresse und Telefonnummer (falls angegeben) überall gleich schreiben: auf der Website, im Profil,
  bei Instagram und Facebook. Geplanter Name: „Alltag kann Sport – Hundetraining Karolin Riesing“.
- **Orte und Leistungen stehen in der Seite, nicht in der Domain:** Glashütte, Osterzgebirge, Dresden,
  Einzeltraining, Welpenkurs usw. in Seitentiteln, Überschriften und Beschreibungen, dazu strukturierte
  Daten (`LocalBusiness`) mit Einzugsgebiet. Das ist geplant (`plan/02-training.md`, „Local SEO“).
- **Search Console:** nur für die Hauptdomain (Domain-Property), Sitemap einreichen. Die
  Weiterleitungs-Domains brauchen keine eigene.
- **Vorgeschichte der Domain:** Eine früher von anderen genutzte Domain kann einen schlechten Ruf bei
  Google haben. Toni schaut vor der Bestellung kurz auf `web.archive.org` nach, ob unter
  `alltag-kann-sport.de` schon einmal etwas stand (von hier aus nicht erreichbar).
- **Querverweise:** Ein Link von `vomluchberg.de` auf die Trainingsseite (und umgekehrt) hilft, ist im
  Footer geplant und zeigt automatisch auf die neue Adresse, sobald sie live ist.

## 0. Vorab klären

- [x] Welche Namen sollen es werden? Training: `alltag-kann-sport.de`; Dackel: `dackelvomluchberg.de` (08.11.2026).
- [ ] Karo: Braucht ihr E-Mail-Adressen mit der neuen Domain (z. B. `hallo@alltag-kann-sport.de`)? *Annahme: nein, die Gmail-Adressen bleiben. Eine Weiterleitung an Gmail ist später jederzeit kostenlos möglich.*
- [ ] Toni: Prüfen, dass beide Seiten unter ihrer Testadresse (`dackel.vomluchberg.de` bzw. `training.vomluchberg.de`) fertig und abgestimmt sind.

## 1. Domains bestellen

- [x] Bei INWX bestellt (08.11.2026): `alltag-kann-sport.de`, `alltagkannsport.de`, `hundetraining-osterzgebirge.de` und `dackelvomluchberg.de`, nur die Domains, Inhaberin Karolin Riesing, Nameserver `sean.ns.cloudflare.com` und `sloan.ns.cloudflare.com`.
- [ ] Prüfen: Automatische Verlängerung ist an.
- [ ] Toni Zugang geben (zusätzlicher Nutzer, kein geteiltes Passwort), falls noch nicht geschehen.

## 2. Toni: DNS auf Cloudflare

Für alle vier Domains:

- [x] Cloudflare → *Add a site* → Domain eingeben → Free-Plan (08.11.2026, alle vier Zonen angelegt).
- [x] Nameserver bei INWX auf Cloudflare (bei der Bestellung eingetragen).
- [ ] Warten, bis Cloudflare die Domains als *Active* zeigt (meist unter einer Stunde).
- [ ] Ohne eigene E-Mail: Schutz gegen gefälschte Absender eintragen
  - `MX` für `@` mit Priorität 0 und Ziel `.` (bedeutet: keine E-Mail)
  - `TXT` für `@`: `v=spf1 -all`
  - `TXT` für `_dmarc`: `v=DMARC1; p=reject;`
- [ ] Mit E-Mail-Weiterleitung stattdessen: *Email → Email Routing* aktivieren, Adresse an Karos Gmail weiterleiten. Cloudflare legt MX und SPF selbst an, dann nur den DMARC-Eintrag mit `p=none` ergänzen.

## 3. Toni: Website verbinden (erst wenn die Seite fertig ist)

- [ ] Im Repo in `src/sites/<id>/wrangler.jsonc` die Adresse unter `routes` von `dackel.vomluchberg.de` bzw. `training.vomluchberg.de` auf `www.dackelvomluchberg.de` bzw. `www.alltag-kann-sport.de` ändern und deployen. Cloudflare legt den DNS-Eintrag und das Zertifikat dabei selbst an. (Alternativ im Dashboard: *Workers & Pages* → Worker → *Settings → Domains & Routes → Add Custom Domain*.)
- [ ] Die alte Testadresse (`dackel.vomluchberg.de` bzw. `training.vomluchberg.de`) per *Rules → Redirect Rules* in der Zone `vomluchberg.de` mit 301 auf die neue www-Adresse weiterleiten (Pfad behalten).
- [ ] Für die Adresse ohne www: DNS-Eintrag `AAAA` für `@` → `100::`, **Proxy an** (orange Wolke). Dann *Rules → Redirect Rules* → Vorlage „Redirect from root to www“, Statuscode 301.
- [ ] Im Worker unter *Settings → Build → Variables*: `SITE_URL=https://www.<domain>` setzen und `SITE_NOINDEX` löschen. Neu bauen lassen.
- [ ] TinaCloud → Projekt → *Site URLs*: `https://www.<domain>` ergänzen.
- [ ] Die `workers.dev`-Adresse des Workers für die Produktion abschalten (*Domains & Routes*).
- [ ] Weiterleitungs-Domains `alltagkannsport.de` und `hundetraining-osterzgebirge.de`: in deren Zone `AAAA` für `@` und `www` → `100::`, Proxy an, dann eine Redirect Rule: alle Anfragen 301 auf `https://www.alltag-kann-sport.de` + Pfad, Query behalten. Kein Worker, keine eigene Seite.

## 4. Testen

- [ ] Startseite, zwei Unterseiten, eine Seite, die es nicht gibt (soll die 404-Seite zeigen).
- [ ] Adresse ohne www eingeben → landet auf www.
- [ ] Nur Training: `alltagkannsport.de/angebote` (und ggf. `karolin-riesing.de`) → landet auf `https://www.alltag-kann-sport.de/angebote`.
- [ ] Kontakt- bzw. Anfrageformular abschicken → Karo bekommt die E-Mail.
- [ ] Impressum und Datenschutz sind erreichbar und vollständig.
- [ ] Hinweis im Footer der anderen Seiten zeigt auf die neue Adresse.

## 5. Google

- [ ] Google Search Console → *Property hinzufügen → Domain* → Bestätigung per DNS-TXT in Cloudflare.
- [ ] Sitemap einreichen: `https://www.<domain>/sitemap-index.xml`.
- [ ] Karo als Nutzerin hinzufügen, falls sie ein Google-Konto hat.
- [ ] Nach einer und nach vier Wochen nachsehen, ob die Seiten im Index sind.

## 6. Nur Training: Umzug von Pfotentermin

Erst wenn `www.alltag-kann-sport.de` läuft und getestet ist:

- [ ] Karo: Alle offenen Anfragen, Reservierungen und Termine aus Pfotentermin persönlich kontaktieren und die neue Adresse nennen.
- [ ] Toni: Kundendaten aus Pfotentermin exportieren und Karo sicher übergeben (nicht als normalen E-Mail-Anhang).
- [ ] Toni: Weiterleitung einschalten: `karolin-riesing.pfotentermin.eu` und `…/s/karolin-riesing` → `www.alltag-kann-sport.de`. Angebote in Pfotentermin auf „inaktiv“ stellen, damit nichts Neues gebucht werden kann.
- [ ] Deine Kundinnen und Kunden behalten ihr Pfotentermin-Konto mit den Daten ihrer Hunde; ihre Profil-Links führen weiter zu Pfotentermin.
- [ ] Testen: alte Pfotentermin-Links landen auf der passenden neuen Seite.
- [ ] Karo: Neue Adresse eintragen bei Google-Unternehmensprofil, Facebook, Instagram, Flyern, Visitenkarten und in der E-Mail-Signatur.
- [ ] In der Übergangszeit (Annahme: 3 Monate) kann Karo sich weiter in Pfotentermin einloggen und nachschauen.
- [ ] Danach: letzter Datenexport, dann den Pfotentermin-Bereich deaktivieren (nicht löschen). Ab dann ist auch Karos Login dort gesperrt. Löschen erst nach Absprache mit Karo.
- [ ] Die Weiterleitung bleibt mindestens ein Jahr bestehen, am besten für immer.
