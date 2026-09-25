# Handoff – state as of 2026-09-25

Handoff from a Claude Cowork session to Claude Code. Read `CLAUDE.md` first for the project conventions.

## What's done

- Project scaffolded from `tina-astro-starter` (Astro 6.4, TinaCMS 3.14, Tailwind 4.3), with blog/space theme/unused adapters removed.
- Content model + Tina schema (German labels for Karo): Seiten (block-based), Unsere Hunde, Würfe (with puppies + gallery), Aktuelles, Einstellungen.
- Content migrated from the old Web Presence Builder site: 9 pages, 6 dogs (Donna → "In Erinnerung"), A-/B-Wurf with all puppies, C-Wurf as "geplant", 21 news posts, and 195 images (resized) in `public/uploads/`.
- Design: light and friendly, orange → pink gradients with neon details, 3 switchable colour schemes, responsive (checked at 390 px and 1366 px, no horizontal overflow), lightbox, contact form.
- Placeholder logo derived from the old line-art emblem (`public/uploads/seiten/logo-*.png`).
- Verified: `build:local` ✅, cloudflare adapter build ✅, `astro check` 0/0 ✅, Tina admin in local mode opens and live-edits a dog page ✅.
- Docs: `README.md` (setup/deploy), `docs/domain-umzug.md` (domain transfer checklist, German).
- Git initialised with remote `origin` → `github.com/tonimoeckel/vomluchberg` (private). Toni does the first commit and push himself.

## Next steps (suggested order)

1. **Deploy a preview** so Karo can review it this weekend:
   - TinaCloud project at app.tina.io → connect the repo, and get `PUBLIC_TINA_CLIENT_ID` + `TINA_TOKEN`.
   - Cloudflare *Workers & Pages → Import repository*. Build: `npm run build`. Deploy: `npx wrangler deploy`. Env: Tina creds, `SITE_URL`, `PUBLIC_FARBVORSCHAU=true` for the review.
   - Verify that the `/admin` login and saving through TinaCloud trigger a rebuild.
2. **Design review with Karo:** she picks a colour scheme and sets it in Tina → Einstellungen. Afterwards set `PUBLIC_FARBVORSCHAU=false`.
3. **Content from Karo** (still waiting): an intro text if she wants to rewrite it, her favourite photos, the logo as a vector (she may make a new silhouette logo), details on the C-Wurf, and name and photos of the new dog from 06.12.2025 ("Willkommen im Rudel").
4. **Legal:** replace the placeholders in `src/content/seiten/impressum.md` and `datenschutz.md`. Mention Cloudflare hosting and Web3Forms.
5. **Contact form:** get a Web3Forms access key registered to Karo's e-mail and set `PUBLIC_WEB3FORMS_KEY`.
6. **Domain transfer** `vomluchberg.de`: separate task, see `docs/domain-umzug.md`. Check e-mail/MX before switching nameservers.

## Possible improvements (not started)

- Image optimisation: images in `public/` are not processed by Astro. Consider responsive variants (e.g. a build-time sharp script or Cloudflare Images) because the dog cards load 1600 px JPEGs.
- The B-Wurf title image is a busy collage (`picsart_24-01-09…`). Ask Karo for a nicer one.
- Some older texts have typos from the original site. Karo should proofread; don't silently rewrite her voice.
- Optional: a "Partner/Links" section (old site had rottweiler.de, Reico, European Pet Pharmacy banners in `public/uploads/seiten/`). Currently unused.
- Optional: structured data (LocalBusiness / Organization JSON-LD) in `BaseHead.astro`.

## Out of scope

- `caninepure.de` / `vitale-hunde.de` (in the same archive), unless Toni asks for them.
