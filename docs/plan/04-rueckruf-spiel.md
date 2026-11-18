# Slice 4 – "Rückruf": a small jump-and-run after an inquiry (training site)

Status: **preview built** (2026-11-18, branch `claude/training-rueckruf-spiel-plan`). Numbered 04
because `03-betrieb.md` already holds slice 3. Builds on the redesign "Waldboden" (branch
`claude/upbeat-goodall-kzb1nc`, not yet on `main`). Open questions for Karo: section
"6. Rückruf-Spiel" in [`fragen-an-karo.md`](fragen-an-karo.md).

**Preview for Karo (instead of the standalone prototype, at Toni's request):** the game is built
into the training site but only reachable by URL parameter, like the secret theme preview:
`?rueckruf` on any page opens it, `?rueckruf=welpe|junghund|pruefung` preselects the level
(combinable with `&themes=active&thema=<id>`). Nothing on the site links to it and it is not
offered after an inquiry yet. Screenshots: [`mockups/training/rueckruf/`](mockups/training/rueckruf/)
(01–07 desktop Waldweg light, 08–09 phone dark "Erde", 10 "Pink" level Prüfung).

What exists (steps P, 1 and most of 2 of §9, without the form hook and without Tina):

- `src/sites/training/lib/karte.ts`: `gelaende()` exported (height field, valley, track control
  points); `karte()` uses it, output byte-identical (checked by snapshot before/after).
- `lib/rueckruf/profil.ts`, `level.ts`, `physik.ts`, `texte.ts`: pure, tested in
  `rueckruf.test.ts`, including a bot that wins every level with 5 paws, a run that never calls
  (the dog runs off) and one that never jumps (stumbles only, still arrives).
- `lib/rueckruf/zeichnen.ts`, `spiel.ts`: canvas drawing in the scheme tokens, `<dialog>`, fixed
  120 Hz timestep, jump buffer, pause on `visibilitychange`/blur, `ResizeObserver`, vertical camera
  that keeps the ground under the dog at one height, best paws in `localStorage`.
- `components/RueckrufVorschau.astro` (loader, 183 bytes) in `layouts/Base.astro`; the game chunk is
  10.6 kB gzip and only fetched with the parameter.

Still open before it may be offered: Karo's yes, the hook after a Web3Forms success (§3), the Tina
switch (§6), the reduced-motion rule for the real entry (the URL preview ignores it, it is an
explicit opt-in), a real-phone fps and touch check. Known gap: in dark mode the ink colour is
light, so the Rottweiler is drawn light; decide whether that is fine or needs its own token.

**Gate:** no further build step before Karo has played the preview and said yes. If she says no,
remove the loader from `Base.astro` and `lib/rueckruf/`; this file stays as a record.

## 1. Summary

After a **successful** inquiry on the training site, the thank-you message stays as it is and a
quiet offer appears below it: "Bis ich mich melde: Lust auf eine Runde Rückruf?" One click opens a
small side-view runner. You stand on the far bank of the Müglitz and call your dog; it runs back
to you along the forest track of the site's own survey map (`lib/karte.ts`), so the terrain is the
real elevation profile of the generated map. One button (Space / Enter / tap). Obstacles are jumped.
**Distractions** (deer, squirrel, jogger, another dog, a sausage) are not jumped: the dog notices
them, and the player has to give the recall signal at the right moment, before the dog commits.
That is the training message of the game, and it is what trainers actually teach: call in time.
At the end the dog sits in front of you: "Sitz. Vorbildlicher Rückruf!" with 1–5 paws.

## 2. Is it worth it?

Arguments against, taken seriously:

- **Karo has said no to play twice.** D11 (`README.md`): the dachshund mockups F "Dackelparade",
  G "Leckerli-Suche" (a click-to-feed game) and H "Schabernack" (scroll gags) were fun but "could
  annoy visitors", and she would not switch them on. The training site follows the same "no
  decorative animation" rule (`02-training.md` §6, `CLAUDE.md`).
- It is pure extra: it brings no inquiry, because it only exists after the inquiry.
- It is the biggest single piece of client code on a site that is otherwise almost script-free.

Why it can still be different this time:

- **Nobody sees it who did not ask for it.** G and H sat on the page every visitor reads. This one
  appears only after someone has sent an inquiry, and only as a button. It never moves on its own.
  It is interactive, not decorative, so it does not break the rule, but Karo must agree to that
  reading (question K-R1).
- **It carries her message.** "Rückruf", "Impulskontrolle", "rechtzeitig rufen" are training
  content. A friendly failure line ("Das Reh war spannender. Genau das üben wir im Training.") is
  a small piece of her voice that a visitor remembers and might repeat to friends.
- **It fits the site's signature.** The level is the survey sketch seen from the side; it reuses
  the map generator and the six colour schemes, it is not a foreign object.
- **Waiting is real.** Karo answers personally; the moment after sending is the one moment a
  visitor has nothing to do on the site.

Recommendation: **worth one prototype session (§9 P), not more, until Karo has played it.** Show it
to her as "a small thank-you for people who sent an inquiry", on her own phone, with the switch in
Tina explained (off by default, §6). If she hesitates, drop it. Cheaper alternatives if she likes
the idea but not a game (offer these in the same conversation):

| Alt. | What | Effort |
| --- | --- | --- |
| A1 | **Static "Rückruf-Tipp"** under the thank-you: one short tip from Karo ("Ruft euren Hund nie zu etwas Unangenehmem"), editable in Tina. No script. | ½ session |
| A2 | **Quiz instead of a game**: another session builds a quiz block; three recall questions could reuse it after the inquiry. | depends on the quiz block |
| A3 | **404 only**: the game lives only on the 404 page ("Hier hat sich jemand verlaufen. Ruft ihn zurück!"), like a browser's offline game. Nobody who wants something is in the way of it. | same as the full game minus the form hook |

## 3. Where and when (entry points)

Facts from `src/sites/training/components/AnfrageFormular.astro`:

- With `PUBLIC_WEB3FORMS_KEY` the script posts with `fetch`; on `j.success` it resets the form and
  writes `data-danke` (Tina `trainingConfig.anfrage.danke`) into `<p role="status" data-status>`.
  **This is the only moment we know an inquiry arrived.**
- Without the key the script sets `location.href = mailto:…`. We cannot know whether the mail was
  sent, and without JS the browser posts `text/plain` to `mailto:`.
- The form is rendered by `AngebotBody.astro` (offer pages) and `blocks/AnfrageBlock.astro`
  (`/anfrage` and any page with the block), so one hook covers every place.

Decisions (working assumptions):

1. **Primary entry: after a Web3Forms success only.** In the success branch the script reveals a
   sibling panel **after the `</form>`** (not inside `role="status"`, so the screen reader reads
   only the thank-you, and not inside the form, so Space/Enter in the game cannot submit or tick
   anything). The panel holds one sentence and one secondary button "Eine Runde Rückruf". Focus is
   not moved, nothing autoplays, the thank-you text is never hidden or covered.
2. **mailto fallback: no offer.** Offering a reward for a mail that maybe was never sent would be
   wrong, and the page has already handed over to the mail program. (Alternative if Toni wants it:
   a line "Mail abgeschickt? Dann …" after a 3 s delay. Not recommended.)
3. **No `/danke` page.** It would need a redirect after the fetch, an indexable URL that people can
   open without an inquiry (a gate in reverse), and it would change the no-JS POST flow. Not worth it.
4. **Optional second entry: the 404 page** (A3), behind the same Tina switch, as a quiet link
   below "Zur Startseite". Decide with Karo (K-R4).
5. **Never** a gate before the form, never a teaser on other pages, no "play while you wait"
   before sending.

## 4. Game design

### 4.1 Level from the map

- `karte.ts` builds `hoeheBei(x, y)` and the track (`weg`: one cubic `C` plus a smooth `S`
  segment) inside `karte()`. The game needs both. Refactor (pure, output byte-identical, guarded
  by `karte.test.ts` and a diff of the training build's `dist/client`): export
  `hoehenfeld(optionen)` (returns `hoeheBei`, `talX`, `gipfel`) and `wegKontrollpunkte(breite, hoehe)`;
  `karte()` uses them. **Coordinate with the session that draws paw prints and the track on the
  hero map**: it probably touches `karte.ts`/`Karte.astro` too. Whoever lands second rebases.
- New pure module `src/sites/training/lib/rueckruf/profil.ts`: sample the track by arc length
  (~1 sample per 4 map units), height = `hoeheBei` at each sample, normalised and **exaggerated**
  (×3, clamped to a maximum slope so an auto-runner never needs to climb a wall). It is a sketch,
  not to scale, which the map already says about itself.
- What the map gives us for free: the track does cross the valley (`talX` ≈ 0.82 of the width),
  so **the Müglitz crossing is real** and becomes the last, widest jump before the finish. The
  summit is *not* on the track (the track runs over the lower slopes); the cone is drawn as a
  background silhouette (one profile line through `gipfel`), so the premise becomes: the dog was
  sniffing below the Luchberg, you stand on the far bank of the Müglitz and call.
- Forest dots of the map (`wald`) become trees in the background where the track passes woodland.
- Levels mirror the offers, same track, different length/density:

| Level | Offer link | Length | Speed | Distractions | Signal window |
| --- | --- | --- | --- | --- | --- |
| Welpe | Welpenkurs | ~45 s | slow | 3, all slow and visible early | 1.0 s |
| Junghund | Basistraining | ~60 s | medium | 6 | 0.8 s |
| Prüfung | Einzeltraining / Hundesport | ~80 s | fast | 9, two in quick succession | 0.6 s |

  Each level ends with one link "Das üben wir im {Angebot}" → `/angebote/<slug>`. No CTA to
  `/anfrage`: they have just sent one.

### 4.2 One button, two meanings

- **Obstacles** (roots, a fallen trunk, a puddle, the stream): jump. Touching one = a stumble
  (0.4 s slower, one "Stolperer"), never a game over. Drawn in the ink/contour colours, they sit
  on the ground and do not move.
- **Distractions** (deer crossing, squirrel up a tree, a jogger, another dog on a lead, a sausage
  on the path): drawn in the copper/accent colour, they **move** and they trigger a cue: the dog's
  head turns, ears up, a small mark above it, the run slows. From that moment the signal window is
  open: pressing the button now is the **recall signal** (no jump, the dog looks back and runs on:
  "+ Impulskontrolle"). Missing the window: the dog veers off for ~1 s, the **Ablenkung** meter
  fills by one step, time is lost. Distinguishable without colour: shape, motion and the cue.
- The level generator never places an obstacle inside a distraction window (plus a margin), so
  the button's meaning is never ambiguous. Unit-tested.
- Optional collectibles: a whistle or a treat on the track (picked up by running through, or by a
  jump for the high ones) drains one step of the meter. Few, so the game stays about timing.
- **Failure:** meter full (3 steps Welpe, 3 Junghund, 2 Prüfung) → the dog runs off after the
  last distraction. Finish screen with a friendly line matching that distraction ("Das Eichhörnchen
  war spannender …"). One button "Nochmal rufen".

### 4.3 Fairness and feel

- Fixed timestep (120 Hz simulation, render on `requestAnimationFrame`, accumulator capped so a
  long frame never tunnels through an obstacle).
- **Coyote time** 80 ms (jump still allowed just after leaving an edge), **jump buffer** 120 ms
  (a press just before landing jumps on landing), variable jump height (release early = lower)
  only if the prototype shows it is needed: one button should stay simple.
- Hitboxes smaller than the drawings (dog ~70 %, obstacles ~80 %); the stream counts as cleared
  when the front paws reach the far bank.
- First 3 s are free of anything; the first obstacle and the first distraction each come with a
  one-line hint the first time only ("Springen: Leertaste oder tippen", "Ein Reh! Jetzt rufen").
- Difficulty rises inside a level by spacing, not by speed jumps.

### 4.4 Score and replay

- Rückruf-Qualität 1–5 paws: distractions handled (60 %), stumbles (25 %), time (15 %). Exact
  formula in `lib/rueckruf/wertung.ts`, tested. 5 paws needs every distraction handled.
- Finish lines per paw count (5: "Sitz. Vorbildlicher Rückruf!", 3: "Gut, aber das Reh hat ihn
  kurz gekostet.", 1: "Der kam eher zufällig. Genau das üben wir im Training."), plus the failure
  lines per distraction. Default texts in the module; editable texts see §6.
- Best paws per level in `localStorage` (`rueckruf:bestwert:<level>`, try/catch, works without).
- Dog: **Rottweiler** first (Karo's breed, in her logo). The **Dackel** as a second dog is a nice
  gag (it runs *under* the fallen trunk but has to jump puddles a Rottweiler just runs through),
  but doubles the tuning. Ask Karo (K-R3), build only if she wants it.

## 5. Tech

- **Files** (all in `src/sites/training/`, so nothing reaches luchberg): `lib/rueckruf/profil.ts`,
  `level.ts` (deterministic generator, seed per level), `physik.ts` (jump, coyote, buffer,
  collisions), `wertung.ts`, `texte.ts`; each pure with a colocated vitest test.
  `lib/rueckruf/spiel.ts` (loop, input, canvas drawing, lifecycle) is the only DOM module.
- **Lazy chunk:** the form script does `const { starte } = await import('../lib/rueckruf/spiel')`
  only on the click of "Eine Runde Rückruf". Vite splits it into its own chunk; pages carry only the
  few lines of the hook. Optionally `import()` on success already (prefetch), not on page load.
- **Budget:** chunk < 12 kB gzip (check in the build output, note the size in the PR). No library.
  Canvas 2D, not SVG: hundreds of moving shapes per frame are cheaper on canvas, and the map's
  SVG paths are not reused at runtime anyway.
- **No image assets.** Dog, deer, squirrel, jogger, other dog, sausage, roots, trunk drawn as a few
  canvas paths (line art like the map, 1.5 px strokes, flat fills). Colours are read from the
  site's tokens with `getComputedStyle(document.documentElement)` (`--bg`, `--heading`, `--fg`,
  `--muted`, `--primary`, `--copper`, `--contour`, `--water`, `--forest`, `--lane`), so it works in
  all six schemes and in dark mode. Re-read on `matchMedia('(prefers-color-scheme: dark)')`
  change and when `data-scheme` changes (the secret theme preview, `MutationObserver`).
- **Performance:** 60 fps on a mid-range phone: draw only the visible terrain slice, pre-render
  the background silhouette once per resize to an offscreen canvas, cap `devicePixelRatio` at 2,
  no shadows/blur filters. Measure on a real Android mid-range device before shipping.
- **Lifecycle:** pause on `visibilitychange` (hidden) and `blur`, resume only by a press ("Weiter"),
  `ResizeObserver` on the stage (orientation change included), stage aspect 2:1 on desktop,
  full width on phones (min height 220 px), Esc or "Beenden" removes the game and returns focus to
  the button that opened it. `pointerdown` for touch, `touch-action: manipulation`, no double-tap
  zoom; Space/Enter only while the stage has focus (`preventDefault` so the page does not scroll).
- **Styles:** a few classes in the existing training utilities (`btn-secondary`, `haar`) plus
  stage styles in the component; no new global tokens. Canvas content is not Tailwind, so it adds
  nothing to the CSS.

## 6. Tina

Minimal, schema identical for every `SITE_ID` (as always):

- `trainingConfig.rueckruf` (object "Rückruf-Spiel nach der Anfrage"):
  - `aktiv` (boolean, "Spiel nach dem Absenden anbieten"). **Empty = off**, so the feature ships
    dark and Karo switches it on herself after approving.
  - `einladung` (string, the sentence above the button; default in code).
  - `aufDerFehlerseite` (boolean, the 404 entry, only if K-R4 is yes).
- Finish and failure lines stay in `texte.ts` for the first version (there are ~15 of them and
  they depend on the score logic). If Karo wants to write them, add a `list` of strings later.
- After the schema change: `npm run dev` once, commit `tina/tina-lock.json`, `build:local:all`.

## 7. Accessibility, motion, privacy

- It is an extra: everything the visitor needs (thank-you, contact, links) is outside it.
- The stage is a focusable element (`tabindex="0"`, visible `:focus-visible` ring in `--primary`)
  (no `role="application"`), with a heading, a one-paragraph text description of the
  game and the controls ("Leertaste, Enter oder Tippen: springen; wenn euer Hund abgelenkt ist:
  rufen"), and an `aria-live="polite"` line for start, pause and result only (not per event).
  Canvas `aria-hidden`.
- Buttons: "Starten", "Pause"/"Weiter", "Nochmal rufen", "Beenden", level choice as a radio group.
  All 44 px targets.
- **`prefers-reduced-motion: reduce`: the offer is not shown.** A side-scroller is motion by
  nature; a "reduced" variant is not worth its own tuning. (Alternative: show the offer with
  "bewegtes Spiel" in the label and drop parallax and the shake. Not recommended for v1.)
- No flashing (nothing changes brightness more than 3×/s), no screen shake at all, **no sound**.
- **Privacy:** no cookies, no tracking, no network request from the game, no analytics of play.
  `localStorage` for best paws only, wrapped in try/catch. Mention nothing new in the privacy page
  (local storage of a game score that never leaves the device is not personal data processing;
  Toni to confirm with the legal text owner if unsure).

## 8. Prototype location (and the CSS scan trap)

The brief suggested `mockups/training/rueckruf/` at the repo root. **That folder would leak into
the luchberg CSS:** `src/styles/global.css` uses Tailwind's automatic source detection over the
whole repo and only excludes `docs/`, `migration/`, root `*.md`, the other sites and `tina/sites`.
A root `mockups/` folder is not excluded, so any class-like word in it would end up in the CSS
inlined into every vomluchberg.de page. The training CSS is safe (`source(none)` + `@source '..'`).

Therefore the prototype goes to **`docs/plan/mockups/training/rueckruf/index.html`**, next to the
existing training and dachshund mockups. `docs/` is excluded by luchberg's `@source not`, Astro
never builds it, and the workers do not ship it. Self-contained single file: inline script and
styles, the map profile precomputed from `karte()` with seed 11 and pasted as a JSON array (so the
file opens from disk without a build), the Waldboden tokens of `trainingsplatz` light/dark copied
in, plus a small scheme switcher so Karo sees two or three schemes.

## 9. Slicing and effort

| Step | Session | Content | Effort |
| --- | --- | --- | --- |
| P | Prototype | `docs/plan/mockups/training/rueckruf/index.html`: Junghund level only, Rottweiler, obstacles + 3 distraction kinds + the stream, signal window, paws, finish lines. Shown to Karo on her phone. | 1 session |
| — | **Karo decides** | yes / no / alternative A1–A3, answers K-R1…K-R6 | – |
| 1 | Pure modules | `karte.ts` refactor (byte-identical output), `profil`, `level`, `physik`, `wertung`, `texte` with tests | 1 session |
| 2 | Game + hook | `spiel.ts` (canvas, loop, input, lifecycle, tokens), panel after the form in the success branch, reduced-motion check, Tina `rueckruf` fields + lock, `build:local:all`, luchberg `dist/client` diff (must be identical) | 1 session |
| 3 | Tuning | three levels, real-phone check (fps, touch latency), bundle size, a11y pass (keyboard only, VoiceOver/TalkBack: the thank-you is read and the game does not trap focus) | ½–1 session |
| 4 | Options | Dackel as second dog, 404 entry, editable finish lines | ½ session each, only on request |

Total for the full game: about **3–4 build sessions** after the prototype, plus Toni's review and
a phone test with Karo. If Karo says no after P, the cost was one session.

## 10. Risks

- Karo says no (likely, given D11): that is the reason for the prototype gate.
- Other sessions on the training site touch the same files: `karte.ts`/`Karte.astro` (hero paw
  prints and track drawing) and possibly `AnfrageFormular.astro`/`AnfrageLeiste.astro` (scroll
  hints). Step 1 and 2 rebase onto whatever lands first; keep the form hook to a few lines.
- The redesign branch is not on `main` yet; build sessions branch from `main` only once
  `git merge-base --is-ancestor origin/claude/upbeat-goodall-kzb1nc origin/main` holds.
- The game is not testable end-to-end without a Web3Forms key: add a dev-only way to open the
  panel (e.g. `?rueckruf=test` in `npm run dev` only, stripped from production builds).
