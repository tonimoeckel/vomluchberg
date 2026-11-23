// Prints public/uploads/training/widerrufsbelehrung.pdf from AGB § 11 (src/content/training/seiten/agb.md).
// The instruction and the model form are taken from the AGB, so the two texts cannot differ; only the
// summary box and the hint above the form are written here (outside the statutory model).
// Run after every change to § 11 or to Karo's contact details: node scripts/widerrufsbelehrung-pdf.mjs
// Needs Playwright with Chromium (not a dependency of this repo): npx playwright install chromium
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const ziel = `${root}public/uploads/training/widerrufsbelehrung.pdf`;
const datei = (pfad) => pathToFileURL(`${root}${pfad}`).href;

const absender = {
	name: 'Alltag kann Sport – Hundetraining',
	anschrift: 'Karolin Riesing · Dorfstr. 2d · 01768 Glashütte OT Luchau',
	kontakt: '0152 28364675 · karolinriesing@gmail.com',
};

const kurzfassung = [
	{
		titel: '14 Tage',
		label: 'Widerrufsfrist',
		text: 'ab dem Tag, an dem ich euren Termin bestätigt habe.',
	},
	{
		titel: '1 Nachricht',
		label: 'So widerruft ihr',
		text: 'Eine kurze E-Mail, Nachricht oder ein Brief an mich reicht. Gründe braucht ihr nicht.',
	},
	{
		titel: 'Termin bald?',
		label: 'Training in den 14 Tagen',
		text: 'Liegt euer Termin in den 14 Tagen, bestätigt mir kurz, dass er trotzdem stattfinden soll und dass ihr wisst: Ist das Training vorbei, endet euer Widerrufsrecht. Bei einem Kurs zahlt ihr nur die Stunden, die schon waren.',
	},
];

const html = (text) =>
	text.replaceAll('\\*', '*').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

/** The paragraphs of § 11 between two headings of the AGB's rich text. */
function absaetze(von, bis) {
	const agb = readFileSync(`${root}src/content/training/seiten/agb.md`, 'utf8');
	const start = agb.indexOf(von);
	const ende = agb.indexOf(bis, start);
	if (start < 0 || ende < 0) throw new Error(`AGB: "${von}" … "${bis}" not found`);
	return agb
		.slice(start + von.length, ende)
		.split(/\n\s*\n/)
		.map((absatz) => absatz.replace(/\s+/g, ' ').trim())
		.filter(Boolean);
}

const belehrung = absaetze('### Widerrufsbelehrung', '### Muster-Widerrufsformular')
	.map((absatz) => {
		const fett = absatz.match(/^\*\*(.+)\*\*$/);
		if (!fett) return `<p>${html(absatz)}</p>`;
		return fett[1].startsWith('Ende') ? `<p class="ende">${html(fett[1])}</p>` : `<h2>${html(fett[1])}</h2>`;
	})
	.join('\n');

const [einleitung, empfaenger, erklaerung, ...rest] = absaetze('### Muster-Widerrufsformular', '## 12.');
const fussnote = rest.pop();
const felder = rest.map((feld) => `<div class="zeile"><span>${html(feld)}</span></div>`).join('\n');

const kopf = `<header>
	<img src="${datei('public/uploads/training/logo/logo-wald.png')}" alt="" />
	<div><strong>${absender.name}</strong><br />${absender.anschrift}<br />${absender.kontakt}</div>
</header>`;
const fuss = (seite) =>
	`<footer><span>www.alltag-kann-sport.de/agb · Abschnitt 11 der AGB</span><span>Seite ${seite} von 2</span></footer>`;

const schrift = (familie, paket, gewicht) => `@font-face {
	font-family: '${familie}'; font-weight: ${gewicht};
	src: url('${datei(`node_modules/@fontsource/${paket}/files/${paket}-latin-${gewicht}-normal.woff2`)}') format('woff2');
}`;

const seiten = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<title>Widerrufsbelehrung – Alltag kann Sport</title>
<style>
${schrift('Red Hat Display', 'red-hat-display', 600)}
${schrift('Red Hat Text', 'red-hat-text', 400)}
${schrift('Red Hat Text', 'red-hat-text', 500)}
/* Scheme "waldweg" of src/sites/training/styles/global.css */
:root { --fg: #1a2a1f; --heading: #16291d; --muted: #4a5848; --border: #d4cdb5; --signal: #356226; --copper: #a5532a; --lane: #dfe2c8; }
@page { size: A4; margin: 0; }
* { box-sizing: border-box; margin: 0; }
body { font: 400 9.4pt/1.5 'Red Hat Text', sans-serif; color: var(--fg); }
.seite { width: 210mm; height: 297mm; padding: 14mm 18mm 12mm; display: flex; flex-direction: column; break-after: page; }
header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 5mm; border-bottom: 1.5px solid var(--heading); }
header img { width: 36mm; }
header div { text-align: right; color: var(--muted); font-size: 8.6pt; line-height: 1.5; }
header strong { font-weight: 500; font-size: 10.5pt; color: var(--heading); }
main { flex: 1; padding-top: 7mm; }
h1 { font: 600 21pt/1.2 'Red Hat Display', sans-serif; color: var(--heading); }
.unter { color: var(--muted); margin-top: 3mm; }
.kurz { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7mm; background: var(--lane); border-radius: 6px; padding: 4.5mm 6mm; margin: 5.5mm 0; }
.kurz h3 { font: 500 15pt/1.2 'Red Hat Text', sans-serif; color: var(--signal); }
.kurz strong { font-weight: 500; display: block; }
.kurz p { margin: 0; }
.regel { border-top: 1px solid var(--border); padding-top: 5mm; }
h2 { font: 500 11pt/1.3 'Red Hat Text', sans-serif; color: var(--heading); margin: 5mm 0 2mm; }
.regel > h2:first-child { margin-top: 0; }
p { margin-bottom: 2.6mm; }
.ende { color: var(--copper); font-weight: 500; margin-top: 4mm; }
.hinweis { background: var(--lane); border-radius: 6px; padding: 3mm 6mm; margin: 6mm 0; }
.an { border-left: 3px solid var(--copper); padding-left: 5mm; margin-bottom: 6mm; }
.frei { height: 24mm; border-bottom: 1.5px solid var(--heading); }
.zeile { height: 17.5mm; border-bottom: 1.5px solid var(--heading); padding-top: 2.5mm; color: var(--muted); font-size: 8.6pt; }
.fussnote { color: var(--muted); font-size: 8.6pt; margin-top: 3mm; }
footer { display: flex; justify-content: space-between; border-top: 1px solid var(--border); padding-top: 3mm; color: var(--muted); font-size: 8pt; }
</style>
</head>
<body>
<section class="seite">
${kopf}
<main>
	<h1>Widerrufsbelehrung</h1>
	<p class="unter">für Trainings, Kurse und Seminare, die ihr per E-Mail, WhatsApp oder Telefon bucht</p>
	<div class="kurz">
		${kurzfassung.map((k) => `<div><h3>${k.titel}</h3><strong>${k.label}</strong><p>${k.text}</p></div>`).join('\n\t\t')}
	</div>
	<div class="regel">
${belehrung}
	</div>
</main>
${fuss(1)}
</section>
<section class="seite">
${kopf}
<main>
	<h1>Muster-Widerrufsformular</h1>
	<p class="unter">${html(einleitung)}</p>
	<p class="hinweis">Ihr müsst dieses Formular nicht benutzen. Eine formlose E-Mail oder Nachricht an mich genügt.</p>
	<p class="an">${html(empfaenger)}</p>
	<p>${html(erklaerung)}</p>
	<div class="frei"></div>
${felder}
	<p class="fussnote">${html(fussnote)}</p>
</main>
${fuss(2)}
</section>
</body>
</html>`;

const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch();
const page = await browser.newPage();
// A data URL could not load the local fonts and the logo, so the page comes from a file URL.
await page.goto(datei('package.json'));
await page.setContent(seiten, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const zuHoch = await page.evaluate(() =>
	[...document.querySelectorAll('.seite')].some((seite) => seite.scrollHeight > seite.clientHeight + 1),
);
if (zuHoch) {
	await browser.close();
	throw new Error('The text no longer fits on its page: shorten the summary or adjust the layout.');
}
await page.pdf({ path: ziel, format: 'A4', printBackground: true });
await browser.close();
console.log(`written: ${ziel}`);
