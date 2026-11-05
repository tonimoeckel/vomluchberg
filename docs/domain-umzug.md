# Domain-Umzug vomluchberg.de

Für die neuen Domains der Dackel- und der Trainingsseite gibt es eine eigene Checkliste: [`domains-neue-seiten.md`](domains-neue-seiten.md).

Eigener Task, unabhängig von der Website. Die neue Seite kann schon vorher unter der Cloudflare-Adresse (`*.workers.dev`) laufen und abgestimmt werden.

**Ziel:** Karo besitzt die Domain in ihrem eigenen Registrar-Account und zahlt die Rechnungen selbst. Das DNS läuft über Cloudflare (kostenlos), die Website über Cloudflare Workers.

## 0. Vorab klären (wichtig!)

- [ ] **E-Mail:** Gibt es Postfächer oder Weiterleitungen auf `@vomluchberg.de`? Die Kontaktadresse auf der alten Seite war eine Gmail-Adresse, aber das bitte beim alten Provider prüfen.
  - Falls ja: E-Mail vor dem Umzug neu unterbringen (z. B. beim neuen Registrar oder bei mailbox.org). Alternativ nutzt ihr eine Weiterleitung über *Cloudflare Email Routing* (kostenlos) an die Gmail-Adresse.
- [ ] Laufzeit und Kündigungsfrist des alten Hosting-Vertrags notieren.
- [ ] Wer ist aktuell als Domain-Inhaber eingetragen? Es muss Karo sein.

## 1. Karo: beim alten Provider

- [ ] Den **AuthInfo-Code** (Übernahme- bzw. Transfercode) für `vomluchberg.de` anfordern.
- [ ] **Die Domain NICHT kündigen oder löschen**, nur den Code anfordern. Den Vertrag kündigt ihr erst nach dem erfolgreichen Transfer (Schritt 5).

## 2. Karo: Account beim neuen Registrar

- [ ] Account mit Karos Daten und Zahlungsmittel anlegen.
  - Empfehlung: **INWX**. Das ist ein deutscher Registrar mit fairen Verlängerungspreisen und ohne Upselling.
  - GoDaddy geht auch. Dort bei der Bestellung alle Zusatzpakete abwählen und auf den Verlängerungspreis achten.
- [ ] Toni Zugang geben: am besten als zusätzlichen Nutzer bzw. Admin, nicht über ein geteiltes Passwort.

## 3. Transfer starten

- [ ] Beim neuen Registrar: *Domain transferieren*, `vomluchberg.de` eingeben, AuthInfo-Code eintragen.
- [ ] Bei .de dauert der Transfer meist nur Minuten bis wenige Stunden.
- [ ] Danach prüfen: Inhaber ist Karo, Automatische Verlängerung ist an.

## 4. DNS auf Cloudflare und Website verbinden

- [ ] Cloudflare-Account (Toni oder Karo) → *Add a site* → `vomluchberg.de` → Free-Plan.
- [ ] Cloudflare liest die bestehenden DNS-Einträge ein. **MX-, TXT- und SPF-Einträge für E-Mail prüfen bzw. übernehmen.**
- [ ] Beim Registrar die **Nameserver** auf die zwei Cloudflare-Nameserver umstellen.
- [ ] In Cloudflare: *Workers & Pages → vomluchberg → Settings → Domains & Routes → Add Custom Domain*, einmal `vomluchberg.de` und einmal `www.vomluchberg.de`.
- [ ] Eine Weiterleitung anlegen, damit nur eine Adresse genutzt wird (z. B. `vomluchberg.de` → `www.vomluchberg.de`, per *Redirect Rule*).
- [ ] Im Cloudflare-Build `SITE_URL=https://www.vomluchberg.de` setzen und neu deployen.

## 5. Abschluss

- [ ] Testen: Startseite, alte Links (z. B. `/rottweilerhuendinnen/baja-vom-luchberg/`), Kontaktformular, E-Mail-Empfang.
- [ ] Google Search Console: Domain verifizieren (per DNS-TXT in Cloudflare) und `sitemap-index.xml` einreichen.
- [ ] Erst jetzt den alten Hosting-Vertrag kündigen und ein Backup behalten (das Archiv liegt in `old_archive/`).
