// The "Rückruf" game in the page (docs/plan/04-rueckruf-spiel.md §5): a <dialog> with a canvas
// stage, a fixed-timestep loop and one button. Loaded as its own chunk, only when asked for
// (components/RueckrufVorschau.astro: ?rueckruf). No network, no cookies; the best paws per level
// live in localStorage (try/catch, the game works without).

import { profil, type Profil } from './profil';
import { istStufe, level, stufen, stufenIds, type Level, type StufeId } from './level';
import { druecken, neu, schritt, wertung, SCHRITT, type Zustand } from './physik';
import { statistik, wegZeile, zielZeile } from './texte';
import { farbTokens, H, zeichne, type Farben } from './zeichnen';

const STIL = `
.rueckruf{margin:auto;width:min(100vw - 24px,980px);max-width:none;max-height:calc(100dvh - 32px);padding:0;border:1px solid var(--border);border-radius:var(--radius,6px);background:var(--bg);color:var(--fg);overflow:auto}
.rueckruf::backdrop{background:color-mix(in oklab,var(--dark,#000) 55%,transparent)}
.rueckruf-kopf{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 20px 0}
@media (max-width:40rem){.rueckruf-kopf,.rueckruf-fuss{padding-inline:14px}.rueckruf-text{margin-inline:14px}.rueckruf-buehne{margin-inline:14px}.rueckruf-tafel{gap:8px;padding:10px}.rueckruf-pfoten svg{width:24px;height:24px}}
.rueckruf h2{margin:0;font-family:var(--font-display,'Red Hat Display',sans-serif);font-weight:600;font-size:1.5rem;color:var(--heading)}
.rueckruf-text{margin:6px 20px 14px;max-width:68ch;font-size:.9375rem;color:var(--muted)}
.rueckruf-buehne{position:relative;margin:0 20px;height:clamp(260px,40vw,60dvh);min-width:0;border-top:1px solid var(--heading);touch-action:manipulation;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;outline:none}
.rueckruf-buehne:focus-visible{outline:2px solid var(--primary);outline-offset:3px}
.rueckruf-buehne canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.rueckruf-tafel{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:12px;padding:16px;text-align:center;overflow:auto;background:color-mix(in oklab,var(--bg) 82%,transparent)}
.rueckruf-tafel[hidden]{display:none}
.rueckruf-tafel h3{margin:0;max-width:30ch;font-family:var(--font-display,'Red Hat Display',sans-serif);font-weight:600;font-size:clamp(1.25rem,2.4vw,1.75rem);line-height:1.15;color:var(--heading)}
.rueckruf-tafel p{margin:0;max-width:52ch;color:var(--muted);font-size:.9375rem}
.rueckruf-stufen{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;border:0;margin:0;padding:0}
.rueckruf-stufen label{cursor:pointer}
.rueckruf-stufen input{position:absolute;opacity:0;pointer-events:none}
.rueckruf-stufen span{display:inline-flex;min-height:44px;align-items:center;padding:0 16px;border:1px solid var(--muted);border-radius:var(--radius,6px);background:var(--card);color:var(--heading);font-weight:500}
.rueckruf-stufen input:checked+span{background:var(--heading);border-color:var(--heading);color:var(--bg)}
.rueckruf-stufen input:focus-visible+span{outline:2px solid var(--primary);outline-offset:2px}
.rueckruf-knoepfe{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}
.rueckruf-pfoten{display:flex;gap:6px;color:var(--copper)}
.rueckruf-pfoten svg{width:30px;height:30px}
.rueckruf-fuss{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 16px;padding:12px 20px 16px;font-size:.875rem;color:var(--muted)}
.rueckruf-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
`;

const pfote = (voll: boolean) =>
  `<svg viewBox="0 0 32 32" aria-hidden="true"><g fill="${voll ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.6"><ellipse cx="16" cy="21" rx="7.5" ry="6.5"/><ellipse cx="7" cy="13" rx="3" ry="4"/><ellipse cx="12.5" cy="7.5" rx="3" ry="4"/><ellipse cx="19.5" cy="7.5" rx="3" ry="4"/><ellipse cx="25" cy="13" rx="3" ry="4"/></g></svg>`;

const speicher = {
  lesen(id: StufeId): number {
    try { return Number(localStorage.getItem(`rueckruf:bestwert:${id}`)) || 0; } catch { return 0; }
  },
  schreiben(id: StufeId, pfoten: number) {
    try { localStorage.setItem(`rueckruf:bestwert:${id}`, String(pfoten)); } catch { /* private mode: no best value */ }
  },
};

let geoeffnet: HTMLDialogElement | null = null;
let profilCache: Profil | null = null;

/** Opens the game. `wunsch` may name a level (welpe, junghund, pruefung). */
export function oeffnen(wunsch?: string | null): void {
  if (geoeffnet) return;
  if (!document.getElementById('rueckruf-stil')) {
    const stil = document.createElement('style');
    stil.id = 'rueckruf-stil';
    stil.textContent = STIL;
    document.head.append(stil);
  }
  profilCache ??= profil();
  const vorher = document.activeElement as HTMLElement | null;
  let stufe: StufeId = istStufe(wunsch) ? wunsch : 'junghund';

  const dialog = document.createElement('dialog');
  dialog.className = 'rueckruf';
  dialog.setAttribute('aria-labelledby', 'rueckruf-titel');
  dialog.innerHTML = `
    <div class="rueckruf-kopf"><h2 id="rueckruf-titel">Rückruf</h2><button type="button" class="btn-secondary" data-zu>Schließen</button></div>
    <p class="rueckruf-text" id="rueckruf-text">Euer Hund schnüffelt unter dem Luchberg, ihr steht am anderen Ufer der Müglitz und ruft ihn. Er läuft den Waldweg zu euch zurück. Leertaste, Enter oder Tippen: springen. Schaut er zu einer Ablenkung, ruft ihr ihn mit derselben Taste, bevor er losläuft.</p>
    <div class="rueckruf-buehne" tabindex="0" role="group" aria-label="Spielfeld" aria-describedby="rueckruf-text">
      <canvas aria-hidden="true"></canvas>
      <div class="rueckruf-tafel" data-tafel></div>
    </div>
    <div class="rueckruf-fuss"><span>Ein kleines Spiel, nur zum Spaß. Kein Ton, nichts wird gesendet.</span><span data-bestwert></span></div>
    <p class="rueckruf-sr" aria-live="polite" data-live></p>`;
  document.body.append(dialog);
  geoeffnet = dialog;

  const buehne = dialog.querySelector<HTMLElement>('.rueckruf-buehne')!;
  const canvas = dialog.querySelector('canvas')!;
  const ctx = canvas.getContext('2d')!;
  const tafel = dialog.querySelector<HTMLElement>('[data-tafel]')!;
  const live = dialog.querySelector<HTMLElement>('[data-live]')!;
  const bestwert = dialog.querySelector<HTMLElement>('[data-bestwert]')!;
  const bewegung = matchMedia('(prefers-reduced-motion: reduce)');
  const dunkel = matchMedia('(prefers-color-scheme: dark)');

  let l: Level = level(stufe, profilCache);
  let z: Zustand = neu(l);
  let modus: 'start' | 'lauf' | 'pause' | 'ende' = 'start';
  let breite = 600;
  let raf = 0;
  let zuletzt = 0;
  let rest = 0;
  let f = farben();

  function farben(): Farben {
    // Resolve every token (some are color-mix()) to rgb through a probe element and a 1×1 canvas.
    const probe = document.createElement('span');
    dialog.append(probe);
    const pixel = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
    const aus = {} as Farben;
    for (const [name, [token, ersatz]] of Object.entries(farbTokens) as [keyof Farben, [string, string]][]) {
      probe.style.color = ersatz;
      probe.style.color = `var(${token})`;
      pixel.fillStyle = ersatz;
      pixel.fillStyle = getComputedStyle(probe).color;
      pixel.clearRect(0, 0, 1, 1);
      pixel.fillRect(0, 0, 1, 1);
      const [r, g, b] = pixel.getImageData(0, 0, 1, 1).data;
      aus[name] = `rgb(${r} ${g} ${b})`;
    }
    probe.remove();
    return aus;
  }

  function groesse() {
    const r = buehne.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    const massstab = (r.height * dpr) / H;
    breite = canvas.width / massstab;
    ctx.setTransform(massstab, 0, 0, massstab, 0, 0);
    malen();
  }

  const malen = () => zeichne({ ctx, breite, f, reduziert: bewegung.matches }, z, l);

  function bild(t: number) {
    raf = 0;
    if (modus !== 'lauf') return;
    rest += Math.min((t - zuletzt) / 1000, 0.1);
    zuletzt = t;
    while (rest >= SCHRITT) { schritt(z, l); rest -= SCHRITT; }
    malen();
    if (z.ende) { zeigeEnde(); return; }
    raf = requestAnimationFrame(bild);
  }

  function laufen() {
    modus = 'lauf';
    tafel.hidden = true;
    tafel.innerHTML = '';
    buehne.focus({ preventScroll: true });
    zuletzt = performance.now();
    rest = 0;
    if (!raf) raf = requestAnimationFrame(bild);
  }

  function starten() {
    l = level(stufe, profilCache!);
    z = neu(l);
    live.textContent = `Stufe ${stufen[stufe].name}. Los geht's.`;
    laufen();
  }

  function pause() {
    if (modus !== 'lauf') return;
    modus = 'pause';
    cancelAnimationFrame(raf);
    raf = 0;
    tafel.innerHTML = `<h3>Pause</h3><p>Euer Hund wartet geduldig.</p><div class="rueckruf-knoepfe"><button type="button" class="btn-primary" data-weiter>Weiter</button><button type="button" class="btn-secondary" data-neu>Von vorn</button></div>`;
    tafel.hidden = false;
    live.textContent = 'Pause.';
    tafel.querySelector<HTMLElement>('[data-weiter]')!.focus();
  }

  function zeigeStart() {
    modus = 'start';
    tafel.innerHTML = `
      <h3>Ruft euren Hund zurück</h3>
      <fieldset class="rueckruf-stufen"><legend class="rueckruf-sr">Stufe</legend>
        ${stufenIds.map((id) => `<label><input type="radio" name="rueckruf-stufe" value="${id}"${id === stufe ? ' checked' : ''}><span>${stufen[id].name}</span></label>`).join('')}
      </fieldset>
      <button type="button" class="btn-primary" data-los>Los geht's</button>`;
    tafel.hidden = false;
    zeigeBestwert();
    malen();
  }

  function zeigeBestwert() {
    const b = speicher.lesen(stufe);
    bestwert.textContent = b ? `Euer Bestwert (${stufen[stufe].name}): ${b} von 5 Pfoten` : '';
  }

  function zeigeEnde() {
    modus = 'ende';
    const w = wertung(z, l);
    const angekommen = z.ende?.art === 'ziel';
    if (angekommen && w.pfoten > speicher.lesen(stufe)) speicher.schreiben(stufe, w.pfoten);
    const zeile = angekommen ? zielZeile(w) : wegZeile(z.ende?.wegen);
    const qualitaet = `Rückruf-Qualität: ${w.pfoten} von 5 Pfoten`;
    const { slug, label } = stufen[stufe].angebot;
    tafel.innerHTML = `
      <h3>${zeile}</h3>
      ${angekommen ? `<div class="rueckruf-pfoten" role="img" aria-label="${qualitaet}">${[1, 2, 3, 4, 5].map((i) => pfote(i <= w.pfoten)).join('')}</div>` : ''}
      <p>${angekommen ? qualitaet + '. ' : ''}${statistik(w)}</p>
      <div class="rueckruf-knoepfe"><button type="button" class="btn-primary" data-neu>Nochmal rufen</button><button type="button" class="btn-secondary" data-stufe>Andere Stufe</button></div>
      <p><a class="textlink" href="/angebote/${slug}">Das üben wir im ${label}</a></p>`;
    tafel.hidden = false;
    live.textContent = `${zeile} ${angekommen ? qualitaet + '.' : ''}`;
    zeigeBestwert();
    tafel.querySelector<HTMLElement>('[data-neu]')!.focus();
  }

  // Input: one button. Keys only while the stage has focus, so the page never scrolls by accident.
  const taste = (e: KeyboardEvent) => {
    if (modus !== 'lauf' || e.target !== buehne) return;
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!e.repeat) druecken(z);
    } else if (e.key === 'p' || e.key === 'P') pause();
  };
  const tippen = (e: PointerEvent) => {
    if (modus !== 'lauf') return;
    e.preventDefault();
    buehne.focus({ preventScroll: true });
    druecken(z);
  };
  const klick = (e: MouseEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-zu]')) dialog.close();
    else if (t.closest('[data-los]') || t.closest('[data-neu]')) starten();
    else if (t.closest('[data-weiter]')) laufen();
    else if (t.closest('[data-stufe]')) zeigeStart();
  };
  const wahl = (e: Event) => {
    const t = e.target as HTMLInputElement;
    if (t.name === 'rueckruf-stufe' && istStufe(t.value)) {
      stufe = t.value;
      l = level(stufe, profilCache!);
      z = neu(l);
      zeigeBestwert();
      malen();
    }
  };
  const sichtbar = () => { if (document.hidden) pause(); };
  const neueFarben = () => { f = farben(); malen(); };
  const beobachter = new ResizeObserver(groesse);
  const schema = new MutationObserver(neueFarben);

  buehne.addEventListener('keydown', taste);
  buehne.addEventListener('pointerdown', tippen);
  dialog.addEventListener('click', klick);
  dialog.addEventListener('change', wahl);
  document.addEventListener('visibilitychange', sichtbar);
  window.addEventListener('blur', pause);
  dunkel.addEventListener('change', neueFarben);
  beobachter.observe(buehne);
  schema.observe(document.documentElement, { attributes: true, attributeFilter: ['data-scheme', 'class'] });
  dialog.addEventListener('close', () => {
    cancelAnimationFrame(raf);
    buehne.removeEventListener('keydown', taste);
    document.removeEventListener('visibilitychange', sichtbar);
    window.removeEventListener('blur', pause);
    dunkel.removeEventListener('change', neueFarben);
    beobachter.disconnect();
    schema.disconnect();
    dialog.remove();
    geoeffnet = null;
    vorher?.focus?.();
  });

  if (import.meta.env.DEV) (window as unknown as { __rueckruf: unknown }).__rueckruf = { get z() { return z; }, get l() { return l; } };

  dialog.showModal();
  groesse();
  zeigeStart();
  tafel.querySelector<HTMLElement>('[data-los]')!.focus();
}
