// The "Ansprache" game in the page (docs/plan/04-rueckruf-spiel.md): a <dialog> with a canvas
// stage and a fixed-timestep loop. You and your dog run together; tap the stage (or Space) to jump,
// tap the dog (or Enter) to speak to it when it gets distracted. Endless, ever faster; the run ends
// when the dog is gone. Loaded as its own chunk, only when asked for (components/AnspracheVorschau.astro).
// No network, no cookies; the dog's name and the best score live in localStorage (try/catch).

import { profil, type Profil } from './profil';
import { welt as baueWelt, type Welt } from './strecke';
import { ansprechen, neu, schritt, springen, wertung, SCHRITT, type Zustand } from './physik';
import { hundename, statistik, wegZeile } from './texte';
import { farbTokens, H, HUND_RADIUS, hundAufBuehne, zeichne, type Farben } from './zeichnen';

const STIL = `
.ansprache{margin:auto;width:min(100vw - 24px,980px);max-width:none;max-height:calc(100dvh - 24px);padding:0;border:1px solid var(--border);border-radius:var(--radius,6px);background:var(--bg);color:var(--fg);overflow:auto}
.ansprache::backdrop{background:color-mix(in oklab,var(--dark,#000) 55%,transparent)}
.ansprache-kopf{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 20px 0}
.ansprache h2{margin:0;font-family:var(--font-display,'Red Hat Display',sans-serif);font-weight:600;font-size:1.5rem;color:var(--heading)}
.ansprache-text{margin:6px 20px 14px;max-width:70ch;font-size:.9375rem;color:var(--muted)}
.ansprache-buehne{position:relative;margin:0 20px;height:clamp(260px,40vw,60dvh);min-width:0;border-top:1px solid var(--heading);touch-action:manipulation;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;outline:none;cursor:pointer}
.ansprache-buehne:focus-visible{outline:2px solid var(--primary);outline-offset:3px}
.ansprache-buehne canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.ansprache-tafel{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:12px;padding:16px;text-align:center;overflow:auto;cursor:default;background:color-mix(in oklab,var(--bg) 84%,transparent)}
.ansprache-tafel[hidden]{display:none}
.ansprache-tafel h3{margin:0;max-width:30ch;font-family:var(--font-display,'Red Hat Display',sans-serif);font-weight:600;font-size:clamp(1.25rem,2.4vw,1.75rem);line-height:1.15;color:var(--heading)}
.ansprache-tafel p{margin:0;max-width:52ch;color:var(--muted);font-size:.9375rem}
.ansprache-tafel label{display:grid;gap:6px;justify-items:center;font-weight:500;color:var(--heading)}
.ansprache-tafel input{width:min(16rem,70vw);min-height:44px;padding:0 12px;border:1px solid var(--muted);border-radius:var(--radius,6px);background:var(--card);color:var(--fg);font:inherit;font-size:1rem;text-align:center}
.ansprache-tafel input:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
.ansprache-tafel .ansprache-punkte{font-family:var(--font-display,'Red Hat Display',sans-serif);font-weight:600;font-size:clamp(2.25rem,5vw,3.25rem);line-height:1;letter-spacing:-.03em;color:var(--heading)}
.ansprache-knoepfe{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}
.ansprache-fuss{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 16px;padding:12px 20px 16px;font-size:.875rem;color:var(--muted)}
.ansprache-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (max-width:40rem){.ansprache-kopf,.ansprache-fuss{padding-inline:14px}.ansprache-text,.ansprache-buehne{margin-inline:14px}.ansprache-tafel{gap:8px;padding:10px}}
`;

const speicher = {
  lesen(schluessel: string): string | null {
    try { return localStorage.getItem(`ansprache:${schluessel}`); } catch { return null; }
  },
  schreiben(schluessel: string, wert: string) {
    try { localStorage.setItem(`ansprache:${schluessel}`, wert); } catch { /* private mode: nothing kept */ }
  },
};

let geoeffnet: HTMLDialogElement | null = null;
let profilCache: Profil | null = null;

/** Opens the game. */
export function oeffnen(): void {
  if (geoeffnet) return;
  if (!document.getElementById('ansprache-stil')) {
    const stil = document.createElement('style');
    stil.id = 'ansprache-stil';
    stil.textContent = STIL;
    document.head.append(stil);
  }
  profilCache ??= profil();
  const welt: Welt = baueWelt(profilCache);
  const vorher = document.activeElement as HTMLElement | null;
  let name = hundename(speicher.lesen('name'));

  const dialog = document.createElement('dialog');
  dialog.className = 'ansprache';
  dialog.setAttribute('aria-labelledby', 'ansprache-titel');
  dialog.innerHTML = `
    <div class="ansprache-kopf"><h2 id="ansprache-titel">Ansprache</h2><button type="button" class="btn-secondary" data-zu>Schließen</button></div>
    <p class="ansprache-text" id="ansprache-text">Ihr lauft mit eurem Hund den Waldweg unter dem Luchberg entlang und springt gemeinsam über Wurzeln, Baumstämme und die Müglitz: Leertaste oder irgendwo tippen. Wird euer Hund auf eine Ablenkung aufmerksam, sprecht ihn rechtzeitig an: auf den Hund tippen oder Enter. Es wird immer schneller.</p>
    <div class="ansprache-buehne" tabindex="0" role="group" aria-label="Spielfeld" aria-describedby="ansprache-text">
      <canvas aria-hidden="true"></canvas>
      <div class="ansprache-tafel" data-tafel></div>
    </div>
    <div class="ansprache-fuss"><span>Ein kleines Spiel, nur zum Spaß. Kein Ton, nichts wird gesendet.</span><span data-bestwert></span></div>
    <p class="ansprache-sr" aria-live="polite" data-live></p>`;
  document.body.append(dialog);
  geoeffnet = dialog;

  const buehne = dialog.querySelector<HTMLElement>('.ansprache-buehne')!;
  const canvas = dialog.querySelector('canvas')!;
  const ctx = canvas.getContext('2d')!;
  const tafel = dialog.querySelector<HTMLElement>('[data-tafel]')!;
  const live = dialog.querySelector<HTMLElement>('[data-live]')!;
  const bestwert = dialog.querySelector<HTMLElement>('[data-bestwert]')!;
  const bewegung = matchMedia('(prefers-reduced-motion: reduce)');
  const dunkel = matchMedia('(prefers-color-scheme: dark)');

  let z: Zustand = neu(welt, Date.now() % 100000);
  let modus: 'start' | 'lauf' | 'pause' | 'ende' = 'start';
  let breite = 600;
  let massstab = 1;
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
    for (const [schluessel, [token, ersatz]] of Object.entries(farbTokens) as [keyof Farben, [string, string]][]) {
      probe.style.color = ersatz;
      probe.style.color = `var(${token})`;
      pixel.fillStyle = ersatz;
      pixel.fillStyle = getComputedStyle(probe).color;
      pixel.clearRect(0, 0, 1, 1);
      pixel.fillRect(0, 0, 1, 1);
      const [r, g, b] = pixel.getImageData(0, 0, 1, 1).data;
      aus[schluessel] = `rgb(${r} ${g} ${b})`;
    }
    probe.remove();
    return aus;
  }

  function groesse() {
    const r = buehne.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    massstab = r.height / H;
    breite = r.width / massstab;
    ctx.setTransform(massstab * dpr, 0, 0, massstab * dpr, 0, 0);
    malen();
  }

  const malen = () => zeichne({ ctx, breite, f, reduziert: bewegung.matches, name }, z, welt);

  function bild(t: number) {
    raf = 0;
    if (modus !== 'lauf') return;
    rest += Math.min((t - zuletzt) / 1000, 0.1);
    zuletzt = t;
    while (rest >= SCHRITT) { schritt(z, welt); rest -= SCHRITT; }
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
    z = neu(welt, Date.now() % 100000);
    live.textContent = `Los geht's mit ${name}.`;
    laufen();
  }

  function pause() {
    if (modus !== 'lauf') return;
    modus = 'pause';
    cancelAnimationFrame(raf);
    raf = 0;
    tafel.innerHTML = `<h3>Pause</h3><p></p><div class="ansprache-knoepfe"><button type="button" class="btn-primary" data-weiter>Weiter</button><button type="button" class="btn-secondary" data-neu>Von vorn</button></div>`;
    tafel.querySelector('p')!.textContent = `${name} wartet geduldig.`;
    tafel.hidden = false;
    live.textContent = 'Pause.';
    tafel.querySelector<HTMLElement>('[data-weiter]')!.focus();
  }

  function zeigeStart() {
    modus = 'start';
    z = neu(welt, 1);
    tafel.innerHTML = `
      <h3>Wie heißt euer Hund?</h3>
      <label><span class="ansprache-sr">Name eures Hundes</span><input name="hundename" maxlength="20" autocomplete="off" spellcheck="false"></label>
      <button type="button" class="btn-primary" data-los>Los geht's</button>`;
    const feld = tafel.querySelector<HTMLInputElement>('input')!;
    feld.value = speicher.lesen('name') ?? '';
    feld.placeholder = name;
    feld.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); los(); } });
    tafel.hidden = false;
    zeigeBestwert();
    malen();
    feld.focus();
  }

  function los() {
    const feld = tafel.querySelector<HTMLInputElement>('input[name="hundename"]');
    if (feld) {
      name = hundename(feld.value);
      if (feld.value.trim()) speicher.schreiben('name', name);
    }
    starten();
  }

  function zeigeBestwert() {
    const b = Number(speicher.lesen('bestwert')) || 0;
    bestwert.textContent = b ? `Euer Bestwert: ${b} Punkte` : '';
  }

  function zeigeEnde() {
    modus = 'ende';
    const w = wertung(z);
    const alt = Number(speicher.lesen('bestwert')) || 0;
    const neuerBestwert = w.punkte > alt;
    if (neuerBestwert) speicher.schreiben('bestwert', String(w.punkte));
    const zeile = wegZeile(name, z.ende?.wegen);
    tafel.innerHTML = `
      <h3 data-zeile></h3>
      <p class="ansprache-punkte">${w.punkte}</p>
      <p>${neuerBestwert && alt ? 'Punkte, neuer Bestwert!' : 'Punkte'}</p>
      <p>${statistik(w)}. Genau das üben wir im Training.</p>
      <div class="ansprache-knoepfe"><button type="button" class="btn-primary" data-neu>Nochmal</button><button type="button" class="btn-secondary" data-start>Anderer Hund</button></div>
      <p><a class="textlink" href="/angebote">Zu den Angeboten</a></p>`;
    tafel.querySelector('[data-zeile]')!.textContent = zeile;
    tafel.hidden = false;
    live.textContent = `${zeile} ${w.punkte} Punkte.`;
    zeigeBestwert();
    tafel.querySelector<HTMLElement>('[data-neu]')!.focus();
  }

  // Input. Keys only while the stage has focus, so the page never scrolls by accident.
  const taste = (e: KeyboardEvent) => {
    if (modus !== 'lauf' || e.target !== buehne) return;
    if (e.key === ' ' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!e.repeat) springen(z);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (!e.repeat) ansprechen(z);
    } else if (e.key === 'p' || e.key === 'P') pause();
  };
  // A tap on the dog speaks to it, a tap anywhere else jumps.
  const tippen = (e: PointerEvent) => {
    if (modus !== 'lauf') return;
    e.preventDefault();
    buehne.focus({ preventScroll: true });
    const r = buehne.getBoundingClientRect();
    const px = (e.clientX - r.left) / massstab, py = (e.clientY - r.top) / massstab;
    const hund = hundAufBuehne(z, welt, breite);
    if (Math.hypot(px - hund.x, py - hund.y) <= HUND_RADIUS) ansprechen(z);
    else springen(z);
  };
  const klick = (e: MouseEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-zu]')) dialog.close();
    else if (t.closest('[data-los]')) los();
    else if (t.closest('[data-neu]')) starten();
    else if (t.closest('[data-weiter]')) laufen();
    else if (t.closest('[data-start]')) zeigeStart();
  };
  const sichtbar = () => { if (document.hidden) pause(); };
  const neueFarben = () => { f = farben(); malen(); };
  const beobachter = new ResizeObserver(groesse);
  const schema = new MutationObserver(neueFarben);

  buehne.addEventListener('keydown', taste);
  buehne.addEventListener('pointerdown', tippen);
  dialog.addEventListener('click', klick);
  document.addEventListener('visibilitychange', sichtbar);
  window.addEventListener('blur', pause);
  dunkel.addEventListener('change', neueFarben);
  beobachter.observe(buehne);
  schema.observe(document.documentElement, { attributes: true, attributeFilter: ['data-scheme', 'class'] });
  dialog.addEventListener('close', () => {
    cancelAnimationFrame(raf);
    document.removeEventListener('visibilitychange', sichtbar);
    window.removeEventListener('blur', pause);
    dunkel.removeEventListener('change', neueFarben);
    beobachter.disconnect();
    schema.disconnect();
    dialog.remove();
    geoeffnet = null;
    vorher?.focus?.();
  });

  if (import.meta.env.DEV) (window as unknown as { __ansprache: unknown }).__ansprache = { get z() { return z; }, welt };

  dialog.showModal();
  groesse();
  zeigeStart();
}
