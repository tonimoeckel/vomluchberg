#!/usr/bin/env python3
"""Recolour Karo's training logo for the green "Waldboden" design (scheme `waldweg`).

Not part of the site build. Needs Python 3 with Pillow and numpy:

    python3 scripts/logo-wald.py                      # writes the files listed in write()
    python3 scripts/logo-wald.py --compare OUT.png    # comparison sheet (original vs new), writes nothing else

Decided with Toni (2026-11-18):
  - light mode: like the original, but the navy (Rottweiler, lettering, lines) becomes a dark grey;
    the copper (dachshund, markings, ground swooshes) stays as it is;
  - dark mode and the dark footer: one colour, the text colour of dark mode.

Sources are the original files, which stay untouched for the navy/copper schemes:
  public/uploads/training/logo/logo.png       navy + copper on transparency (332x200)
  public/uploads/training/logo/logo-hell.png  one-colour light version (332x200)
  public/uploads/training/logo/favicon.png    navy + copper on a light blue tile (512x512)

Every pixel is decomposed into a mix of the source colours (plus alpha) and recomposed with
the new colours, so anti-aliasing and transparency are kept.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
LOGO = ROOT / 'public/uploads/training/logo'
SITE_PUBLIC = ROOT / 'src/sites/training/public'

NAVY = (25, 52, 80)
COPPER = (185, 102, 55)
TILE = (200, 217, 232)  # favicon background

# Contrast (WCAG): GREY 11.3:1 and COPPER 3.6:1 on PAPER, GREY vs COPPER 3.1:1;
# TEXT_DARK >= 13.4:1 on #111a14, #13241a and #0b130e (dark bg and both footers).
GREY = '#2f322f'
PAPER = '#f4efe0'  # --bg (light)
TEXT_DARK = '#eeead9'  # --fg / --on-dark (dark)


def rgb(c):
    if isinstance(c, tuple):
        return np.array(c, float)
    h = c.lstrip('#')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], float)


def weights(px, sources):
    """Barycentric weights of each pixel w.r.t. the source colours (least squares, clamped)."""
    S = np.array(sources, float)
    if len(S) == 2:
        d = S[1] - S[0]
        t = np.clip(((px - S[0]) @ d) / (d @ d), 0, 1)
        return np.stack([1 - t, t], -1)
    A = np.vstack([S.T, np.ones(len(S))])
    b = np.concatenate([px.reshape(-1, 3), np.ones((px.shape[0] * px.shape[1], 1))], 1)
    w = np.clip(np.linalg.lstsq(A, b.T, rcond=None)[0].T, 0, None)
    w /= w.sum(1, keepdims=True)
    return w.reshape(px.shape[0], px.shape[1], len(S))


def recolour(src, mapping):
    """mapping: source colour -> target colour; alpha is kept."""
    im = np.asarray(Image.open(src).convert('RGBA')).astype(float)
    px, alpha = im[..., :3], im[..., 3:]
    w = weights(px, list(mapping))
    out = sum(w[..., i:i + 1] * rgb(t) for i, t in enumerate(mapping.values()))
    out = np.concatenate([np.clip(np.round(out), 0, 255), alpha], -1).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def one_colour(src, colour):
    im = Image.open(src).convert('RGBA')
    out = Image.new('RGBA', im.size, tuple(int(v) for v in rgb(colour)) + (255,))
    out.putalpha(im.getchannel('A'))
    return out


def hell():
    return recolour(LOGO / 'logo.png', {NAVY: GREY, COPPER: COPPER})


def dunkel():
    return one_colour(LOGO / 'logo-hell.png', TEXT_DARK)


def favicon():
    return recolour(LOGO / 'favicon.png', {NAVY: GREY, COPPER: COPPER, TILE: PAPER}).convert('RGB')


def scaled(im, size):
    # resize in premultiplied alpha so transparent pixels don't bleed colour into the edges
    return im.convert('RGBa').resize(size, Image.LANCZOS).convert('RGBA')


def save_png(im, path):
    im.save(path, optimize=True)
    print('wrote', path.relative_to(ROOT))


def write():
    h, d, fav = hell(), dunkel(), favicon()
    save_png(h, LOGO / 'logo-wald.png')
    save_png(d, LOGO / 'logo-wald-dunkel.png')
    save_png(scaled(h, (83, 50)), LOGO / 'logo-wald-klein.png')
    save_png(scaled(d, (83, 50)), LOGO / 'logo-wald-klein-dunkel.png')
    save_png(fav, LOGO / 'favicon-wald.png')
    save_png(fav.resize((192, 192), Image.LANCZOS), SITE_PUBLIC / 'icon-192.png')
    save_png(fav.resize((180, 180), Image.LANCZOS), SITE_PUBLIC / 'apple-touch-icon.png')
    fav.resize((48, 48), Image.LANCZOS).save(SITE_PUBLIC / 'favicon.ico', sizes=[(48, 48), (32, 32), (16, 16)])
    print('wrote', (SITE_PUBLIC / 'favicon.ico').relative_to(ROOT))


def compare(out):
    """Rows original / new: light logo on paper, dark logo on bg, footer (light), footer (dark), favicon."""
    bgs = [PAPER, '#111a14', '#13241a', '#0b130e']
    pad, lw, lh = 16, 332, 200
    rows = [
        ([Image.open(LOGO / 'logo.png').convert('RGBA')] + [Image.open(LOGO / 'logo-hell.png').convert('RGBA')] * 3,
         Image.open(LOGO / 'favicon.png').convert('RGBA')),
        ([hell()] + [dunkel()] * 3, favicon().convert('RGBA')),
    ]
    W = pad + 4 * (lw + pad) + 128 + pad
    sheet = Image.new('RGBA', (W, len(rows) * (lh + 2 * pad)), (128, 128, 128, 255))
    for r, (logos, fav) in enumerate(rows):
        y = r * (lh + 2 * pad) + pad
        for i, (logo, bg) in enumerate(zip(logos, bgs)):
            tile = Image.new('RGBA', (lw, lh), tuple(int(v) for v in rgb(bg)) + (255,))
            tile.alpha_composite(logo)
            sheet.paste(tile, (pad + i * (lw + pad), y))
        x = pad + 4 * (lw + pad)
        sheet.paste(fav.resize((128, 128), Image.LANCZOS), (x, y))
        sheet.paste(fav.resize((32, 32), Image.LANCZOS), (x, y + 136))
        sheet.paste(fav.resize((16, 16), Image.LANCZOS), (x + 40, y + 136))
    sheet.save(out)
    print('wrote', out)


if __name__ == '__main__':
    if len(sys.argv) == 3 and sys.argv[1] == '--compare':
        compare(sys.argv[2])
    else:
        write()
