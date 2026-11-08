// Preview switcher for choosing a colour scheme with Karo. Loaded on demand by
// ../components/ThemeVorschau.astro only while the preview is on (<html data-themes>), so its
// markup and texts never appear on the normal site. Plain DOM, no framework.
import { FARBSCHEMATA, farbschema, mitVorschau, ohneVorschau, vorschauConfig } from './farbschema';

const THEMA_KEY = `${vorschauConfig.speicher}-thema`;

function speichern(fn: (s: Storage) => void) {
  try {
    fn(sessionStorage);
  } catch {
    // Storage blocked: links still carry the choice.
  }
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, klasse: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  e.className = klasse;
  if (text) e.textContent = text;
  return e;
}

export function starten() {
  const html = document.documentElement;
  if (!('themes' in html.dataset) || document.getElementById('theme-vorschau')) return;
  const aktuell = () => farbschema(html.dataset.farbe);

  const box = el('div', 'fixed bottom-3 right-3 z-50 w-[min(19rem,calc(100vw-1.5rem))] rounded-card border border-border bg-card p-3 text-fg shadow-[var(--shadow)]');
  box.id = 'theme-vorschau';
  box.setAttribute('role', 'region');
  box.setAttribute('aria-label', 'Farbvorschau');

  const kopf = el('div', 'flex items-baseline justify-between gap-2');
  kopf.append(el('p', 'font-display text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-muted', 'Farbvorschau'));
  const schliessen = el('button', 'cursor-pointer text-[0.8rem] text-muted underline hover:text-primary-ink', 'Beenden');
  schliessen.type = 'button';
  kopf.append(schliessen);

  const name = el('p', 'mt-1 font-display text-2xl font-extrabold uppercase leading-none text-heading');
  name.setAttribute('aria-live', 'polite');

  const liste = el('div', 'mt-3 grid grid-cols-2 gap-1.5');
  const knoepfe = FARBSCHEMATA.map((s) => {
    const b = el('button', 'flex cursor-pointer items-center gap-2 rounded-card border-2 border-transparent px-2 py-1.5 text-left text-[0.85rem] font-semibold leading-tight text-fg hover:bg-surface aria-pressed:border-copper');
    b.type = 'button';
    b.dataset.thema = s.id;
    b.title = s.tinaLabel;
    const punkt = el('span', 'block size-7 shrink-0 rounded-full border border-border');
    punkt.style.background = s.swatch;
    b.append(punkt, s.label);
    liste.append(b);
    return b;
  });

  box.append(kopf, name, liste, el('p', 'mt-3 text-[0.85rem] leading-snug text-muted', 'Gefällt dir eins? Sag Toni, welches.'));

  const meta = [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')];
  const zeigen = () => {
    const s = aktuell();
    name.textContent = s.label;
    for (const b of knoepfe) b.setAttribute('aria-pressed', String(b.dataset.thema === s.id));
    for (const m of meta) m.content = m.media.includes('dark') ? s.themeColor.dark : s.themeColor.light;
  };

  liste.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('[data-thema]');
    if (!b?.dataset.thema) return;
    html.dataset.farbe = b.dataset.thema;
    speichern((s) => s.setItem(THEMA_KEY, b.dataset.thema!));
    // The address shows the scheme, so Karo can also just send the link.
    const url = mitVorschau(location.href, location.href, b.dataset.thema);
    if (url) history.replaceState(history.state, '', url);
    zeigen();
  });

  schliessen.addEventListener('click', () => {
    speichern((s) => {
      s.removeItem(vorschauConfig.speicher);
      s.removeItem(THEMA_KEY);
    });
    location.assign(ohneVorschau(location.href));
  });

  // Internal links keep the preview (also when opened in a new tab or copied).
  const links = (e: Event) => {
    const a = (e.target as Element | null)?.closest?.('a[href]');
    if (!(a instanceof HTMLAnchorElement) || box.contains(a)) return;
    const url = mitVorschau(a.getAttribute('href') ?? '', location.href, aktuell().id);
    if (url) a.href = url;
  };
  for (const typ of ['click', 'auxclick', 'contextmenu', 'focusin']) document.addEventListener(typ, links, true);

  zeigen();
  document.body.append(box);
}
