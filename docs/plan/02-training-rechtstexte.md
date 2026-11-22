# Training: legal texts for go-live

Prepared on 2026-11-22 after Karo asked why Google doesn't find the site. Reason: the worker
`vomluchberg-training` is built with `SITE_NOINDEX=true` (`robots.txt` `Disallow: /`, meta
`noindex, nofollow`), which stays until the marked placeholders are gone (`03-betrieb.md`).
The blocks below are ready to paste into `src/content/training/seiten/*.md` once Karo answers the
open questions in `fragen-an-karo.md` (§ 11 TSchG permit, AGB check by Karo).

## Go-live checklist

1. **Impressum, authority** (`impressum.md`): filled in with the office Karo named on
   2026-11-22. Her final exam is on 2026-11-25 and the permit comes after it; delete the
   placeholder line only once it is granted. Until then the site stays noindex, because `home.md`
   ("§ 11 TSchG, behördlich genehmigt") and `ueber-mich.md` already state the permit.
2. **Impressum, Umsatzsteuer**: done 2026-11-22, Karo is a Kleinunternehmerin, section removed.
3. **AGB § 11 Widerrufsrecht** (`agb.md`): keep the exception only if a lawyer confirms it for
   Einzeltraining and Verhaltensberatung; otherwise variant B below.
4. **Datenschutz**: done for the current state (form opens the visitor's mail program, no
   `PUBLIC_WEB3FORMS_KEY` on the worker). Only if Web3Forms is switched on later: see below.
5. Remove the draft notes: `*Hinweis: Bitte vor dem Livegang prüfen …*` (Impressum, last line) and
   `*Hinweis: Entwurf. …*` (Datenschutz, first line), ideally after a check with a generator
   (e.g. e-recht24, datenschutz-generator.de).
6. `grep -rn PLATZHALTER src/content/training` is empty.
7. Cloudflare → worker `vomluchberg-training` → build variables (production): delete
   `SITE_NOINDEX` (previews keep it), redeploy. Check `https://www.alltag-kann-sport.de/robots.txt`
   (`Allow: /` + sitemap) and that the meta `noindex` is gone.
8. Google Search Console: domain property `alltag-kann-sport.de` (DNS TXT via Cloudflare), submit
   `https://www.alltag-kann-sport.de/sitemap-index.xml`, request indexing of `/`. Karo's Business
   Profile links to `https://www.alltag-kann-sport.de`.

## AGB § 11: Widerrufsrecht

**A. Exception confirmed:** delete the placeholder paragraph, keep the rest of § 11.

**B. Exception not (fully) applicable:** replace the whole § 11 body (both paragraphs below the
heading) with the statutory model (Anlage 1 zu Art. 246a § 1 Abs. 2 Satz 2 EGBGB, version for
services). It stays in **"Sie"** on purpose: only the unaltered model gives the legal presumption
of a correct instruction (Art. 246a § 1 Abs. 2 Satz 2 EGBGB), so don't adapt it to the site's
"ihr". Check the wording against the current model on gesetze-im-internet.de before pasting (the
model changed with the EU withdrawal-function rules from 19.06.2026). The withdrawal button
(§ 356a BGB) applies to contracts concluded through an online interface; the site only sends
inquiries and Karo concludes by phone or email, so it shouldn't apply. Let the lawyer confirm
that too.

```md
      Für Verträge, die wir per E-Mail, Telefon oder Nachricht schließen, gilt das folgende Widerrufsrecht. Wann ihr kostenfrei absagen könnt, steht außerdem in den Abschnitten 7 und 8.

      ### Widerrufsbelehrung

      **Widerrufsrecht**

      Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.

      Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.

      Um Ihr Widerrufsrecht auszuüben, müssen Sie mich (Karolin Riesing, Alltag kann Sport – Hundetraining, Dorfstr. 2d, 01768 Glashütte OT Luchau, Telefon: 0152 28364675, E-Mail: karolinriesing@gmail.com) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das unten stehende Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.

      Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.

      **Folgen des Widerrufs**

      Wenn Sie diesen Vertrag widerrufen, habe ich Ihnen alle Zahlungen, die ich von Ihnen erhalten habe, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei mir eingegangen ist. Für diese Rückzahlung verwende ich dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.

      Haben Sie verlangt, dass die Dienstleistungen während der Widerrufsfrist beginnen sollen, so haben Sie mir einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem Sie mich von der Ausübung des Widerrufsrechts hinsichtlich dieses Vertrags unterrichten, bereits erbrachten Dienstleistungen im Vergleich zum Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.

      **Ende der Belehrung**

      ### Muster-Widerrufsformular

      (Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)

      An Karolin Riesing, Alltag kann Sport – Hundetraining, Dorfstr. 2d, 01768 Glashütte OT Luchau, E-Mail: karolinriesing@gmail.com:

      Hiermit widerrufe(n) ich/wir (\*) den von mir/uns (\*) abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung (\*)

      Bestellt am (\*)

      Name des/der Verbraucher(s)

      Anschrift des/der Verbraucher(s)

      Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)

      Datum

      (\*) Unzutreffendes streichen.
```

Notes on B:

- The model switches "uns/wir" to "mich/ich" (sole trader). The goods-only clause about delivery
  costs is left out because no goods are delivered. Both are the kind of adaptation the model's
  design notes allow, but have them checked with the rest.
- Consequence for Karo's practice: if a training starts within the 14 days, she needs the
  customer's explicit request for that (e.g. a line in the confirmation email: "Ihr möchtet, dass
  das Training vor Ende der Widerrufsfrist beginnt"), otherwise she can't charge for the part
  already given (§ 357a Abs. 2 BGB). She also has to send the instruction with the confirmation
  (durable medium, e.g. as text in the email or a link to `/agb`).

## Datenschutz: only if Web3Forms is switched on

If `PUBLIC_WEB3FORMS_KEY` is set on the worker, the form posts to Web3Forms instead of opening the
mail program. Then replace the paragraph "Beim Absenden öffnet sich …" in `datenschutz.md` with
the block below and fill in the operator from the DPA (web3forms.com/dpa names "Web3Creative" as
processor; legal form and address weren't readable automatically, look them up in the browser and
accept the DPA in the Web3Forms account first).

```md
      Für den Versand nutze ich den Formular-Dienst Web3Forms (web3forms.com) von [Firmenname, Anschrift laut Auftragsverarbeitungsvertrag], der eure Angaben per E-Mail an mich weiterleitet. Mit dem Anbieter besteht ein Auftragsverarbeitungsvertrag. Dabei können Daten in die USA übertragen werden; Grundlage sind die Standardvertragsklauseln der EU-Kommission.
```
