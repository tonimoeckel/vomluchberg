# Domains für die Dackel- und die Trainingsseite

Checkliste für Karo und Toni. Sie funktioniert wie der [Domain-Umzug von vomluchberg.de](domain-umzug.md),
nur einfacher: Die neuen Domains werden **neu bestellt**, es gibt keinen alten Provider und keinen
Übernahmecode. Die technischen Details stehen in [`plan/03-betrieb.md`](plan/03-betrieb.md).

**Ziel:** Beide Domains gehören Karo (eigener Registrar-Account, sie zahlt selbst). Das DNS läuft über
Cloudflare (kostenlos), die Websites laufen über Cloudflare Workers, genau wie bei `vomluchberg.de`.

| Seite | Wunsch-Domain (Annahme) | Am 05.11.2026 frei? |
| --- | --- | --- |
| Rauhaardackel | `rauhaardackel-vom-luchberg.de` | ja |
| Hundetraining | `alltag-kann-sport.de` | ja |

Weitere freie Alternativen (Stand 05.11.2026): `dackel-vom-luchberg.de`, `rauhaardackelvomluchberg.de`,
`teckel-vom-luchberg.de`, `alltagkannsport.de`, `karolin-riesing.de`, `hundetraining-riesing.de`.
Bitte direkt vor der Bestellung noch einmal prüfen, Domains können jederzeit vergeben werden.

Die Adresse wird immer mit **www** genutzt (z. B. `www.alltag-kann-sport.de`). Wer die Adresse ohne www
eintippt, landet automatisch auch dort.

## 0. Vorab klären

- [ ] Karo: Welche zwei Namen sollen es werden? (Fragen in [`plan/fragen-an-karo.md`](plan/fragen-an-karo.md), Abschnitt „Betrieb & Domains“)
- [ ] Karo: Braucht ihr E-Mail-Adressen mit der neuen Domain (z. B. `hallo@alltag-kann-sport.de`)? *Annahme: nein, die Gmail-Adressen bleiben. Eine Weiterleitung an Gmail ist später jederzeit kostenlos möglich.*
- [ ] Toni: Prüfen, dass beide Seiten unter ihrer Cloudflare-Testadresse (`….workers.dev`) fertig und abgestimmt sind. Die Domain kann aber auch schon vorher bestellt werden.

## 1. Karo: Domains bestellen

- [ ] Beim Registrar anmelden. Am besten derselbe Account wie für `vomluchberg.de` (Empfehlung: **INWX**).
- [ ] Beide Domains bestellen, nur die Domain, **ohne** Webspace, E-Mail-Paket oder sonstige Zusatzpakete.
- [ ] Prüfen: Inhaberin ist Karo, Automatische Verlängerung ist an.
- [ ] Toni Zugang geben (zusätzlicher Nutzer, kein geteiltes Passwort), falls noch nicht geschehen.

## 2. Toni: DNS auf Cloudflare

Für jede der beiden Domains:

- [ ] Cloudflare → *Add a site* → Domain eingeben → Free-Plan.
- [ ] Beim Registrar die **Nameserver** auf die zwei Cloudflare-Nameserver umstellen. Warten, bis Cloudflare die Domain als *Active* zeigt (meist unter einer Stunde).
- [ ] Ohne eigene E-Mail: Schutz gegen gefälschte Absender eintragen
  - `MX` für `@` mit Priorität 0 und Ziel `.` (bedeutet: keine E-Mail)
  - `TXT` für `@`: `v=spf1 -all`
  - `TXT` für `_dmarc`: `v=DMARC1; p=reject;`
- [ ] Mit E-Mail-Weiterleitung stattdessen: *Email → Email Routing* aktivieren, Adresse an Karos Gmail weiterleiten. Cloudflare legt MX und SPF selbst an, dann nur den DMARC-Eintrag mit `p=none` ergänzen.

## 3. Toni: Website verbinden (erst wenn die Seite fertig ist)

- [ ] *Workers & Pages* → Worker (`vomluchberg-dackel` bzw. `alltag-kann-sport`) → *Settings → Domains & Routes → Add Custom Domain* → `www.<domain>`.
- [ ] Für die Adresse ohne www: DNS-Eintrag `AAAA` für `@` → `100::`, **Proxy an** (orange Wolke). Dann *Rules → Redirect Rules* → Vorlage „Redirect from root to www“, Statuscode 301.
- [ ] Im Worker unter *Settings → Build → Variables*: `SITE_URL=https://www.<domain>` setzen und `SITE_NOINDEX` löschen. Neu bauen lassen.
- [ ] TinaCloud → Projekt → *Site URLs*: `https://www.<domain>` ergänzen.
- [ ] Die `workers.dev`-Adresse des Workers für die Produktion abschalten (*Domains & Routes*).

## 4. Testen

- [ ] Startseite, zwei Unterseiten, eine Seite, die es nicht gibt (soll die 404-Seite zeigen).
- [ ] Adresse ohne www eingeben → landet auf www.
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
- [ ] Toni: Weiterleitung einschalten: `karolin-riesing.pfotentermin.eu` und `…/s/karolin-riesing` → `www.alltag-kann-sport.de`. Online-Anfragen in Pfotentermin abschalten.
- [ ] Testen: alte Pfotentermin-Links landen auf der passenden neuen Seite.
- [ ] Karo: Neue Adresse eintragen bei Google-Unternehmensprofil, Facebook, Instagram, Flyern, Visitenkarten und in der E-Mail-Signatur.
- [ ] Nach etwa 4 Wochen ohne Probleme: Pfotentermin-Zugang deaktivieren (nicht löschen). Löschen erst nach Absprache mit Karo.
- [ ] Die Weiterleitung bleibt mindestens ein Jahr bestehen, am besten für immer.
