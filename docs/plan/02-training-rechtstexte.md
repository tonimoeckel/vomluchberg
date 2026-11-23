# Training: legal texts

Prepared on 2026-11-22 after Karo asked why Google doesn't find the site. `SITE_NOINDEX` was
deleted from the production build of the worker `vomluchberg-training` on 2026-11-23 (Toni's
call, before the § 11 permit), and Google Search Console has the domain property
`alltag-kann-sport.de` with the sitemap. To lock the site again: set `SITE_NOINDEX=true` in the
build variables and redeploy.

## Status

1. **Impressum, authority**: the office Karo named on 2026-11-22. Her final exam is on
   2026-11-25 and the permit comes after it; delete the placeholder line once it is granted.
   `home.md` ("§ 11 TSchG, behördlich genehmigt") and `ueber-mich.md` already state the permit.
2. **Impressum, Umsatzsteuer**: Kleinunternehmerin, section removed (2026-11-22).
3. **Datenschutz**: describes the form as it works (opens the visitor's mail program, no
   `PUBLIC_WEB3FORMS_KEY`). If Web3Forms is switched on later: see the last section.
4. **AGB § 11 Widerrufsrecht**: decided 2026-11-23 without a lawyer (Toni). Every offer gets the
   statutory withdrawal right with the unaltered model instruction and form (Anlage 1/2 zu
   Art. 246a EGBGB, kept in "Sie" because only the unaltered model counts as a correct
   instruction), plus the request for an early start. We don't rely on the exception for
   leisure services (§ 312g Abs. 2 Nr. 9 BGB): whether dog training is a "Freizeitbetätigung" is
   open, and if it isn't, a missing instruction extends the withdrawal period to 12 months and
   14 days and Karo can't charge for training already given. The price of the safe variant:
   someone who books less than 14 days ahead can withdraw free of charge before the first lesson,
   despite the fees in §§ 7 and 8. Karo's AI draft (2026-11-23, "kann ... ausgeschlossen sein,
   sofern ...") was not used: it leaves the customer unsure whether the right exists, which
   is not transparent, and it promises a separate instruction anyway.
5. Open: the draft notes `*Hinweis: …*` at the end of the Impressum and at the top of the
   Datenschutz, ideally after a check with a generator (e.g. e-recht24,
   datenschutz-generator.de). Not checked by anyone: whether the withdrawal button (§ 356a BGB,
   from 19.06.2026, for contracts concluded through an online interface) can ever apply; Karo
   concludes by email, WhatsApp or phone, the site only sends inquiries.

## Instruction as PDF

`public/uploads/training/widerrufsbelehrung.pdf` (2026-11-23, linked from AGB § 11), A4, two
pages in the site's look (scheme `waldweg`, Red Hat fonts, `logo-wald.png`): page 1 a short
summary box in "ihr" (14 days, how to withdraw, early start), then the instruction; page 2 the
model form with lines to fill in. The instruction and the form are copied 1:1 from `agb.md` § 11,
only the summary and the hint "Ihr müsst dieses Formular nicht benutzen" are added outside the
model. Printed from HTML with Chromium (Playwright `page.pdf`). Karo attaches it to every
booking confirmation. **If § 11 or Karo's contact details change, make a new PDF**, otherwise the
two texts differ.

## Booking confirmation for Karo

The instruction must reach the customer on a durable medium: the full text in the email or
message, a link to `/agb` is not enough. Template (German, for Karo):

```text
Hallo [Name],

hiermit bestätige ich euren Termin: [Angebot] am [Datum] um [Uhrzeit], [Ort], [Preis] €.
Es gelten meine AGB: https://www.alltag-kann-sport.de/agb
Die Widerrufsbelehrung hänge ich euch als PDF an.

[nur wenn der Termin oder Kursbeginn weniger als 14 Tage entfernt ist:]
Da euer Termin innerhalb der 14-tägigen Widerrufsfrist liegt, antwortet mir bitte kurz mit:
„Ich möchte, dass das Training vor Ende der Widerrufsfrist beginnt. Mir ist bekannt, dass mein
Widerrufsrecht erlischt, sobald das Training vollständig erbracht ist.“

Viele Grüße
Karo
```

Without that reply Karo may still give the training, but if the customer withdraws she can't
charge for it.

## Datenschutz: only if Web3Forms is switched on

If `PUBLIC_WEB3FORMS_KEY` is set on the worker, the form posts to Web3Forms instead of opening the
mail program. Then replace the paragraph "Beim Absenden öffnet sich …" in `datenschutz.md` with
the block below and fill in the operator from the DPA (web3forms.com/dpa names "Web3Creative" as
processor; legal form and address weren't readable automatically, look them up in the browser and
accept the DPA in the Web3Forms account first).

```md
      Für den Versand nutze ich den Formular-Dienst Web3Forms (web3forms.com) von [Firmenname, Anschrift laut Auftragsverarbeitungsvertrag], der eure Angaben per E-Mail an mich weiterleitet. Mit dem Anbieter besteht ein Auftragsverarbeitungsvertrag. Dabei können Daten in die USA übertragen werden; Grundlage sind die Standardvertragsklauseln der EU-Kommission.
```
