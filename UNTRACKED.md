# Untracked working files

This repo intentionally tracks only the storefront source. Several folders and
files in the working directory are **not tracked** and show up as `??` in
`git status`. This file records what each one is, why it is not tracked, and
what would have to happen before it could be committed.

| Item | What it is | Why it is untracked | Before it could be tracked |
|---|---|---|---|
| `product images/` | Owner's source material: the `manual cured/` originals (`.jfif`), scraped reference photos (`PetSafe …/`), the cure/scrape scripts, and leftover Chrome debug-profile folders | Contains copyrighted competitor scrapes, large binaries and browser-profile junk; nothing here is needed to build or run the storefront | Curate: keep only what the site needs, convert photos to `.jpg`/`.webp` under `public/assets/…`, move the scripts to `scripts/` if they should live in the repo, and leave the scrapes and Chrome profiles out |
| `product-photos.pdf` | PDF of product photography, unreviewed | Large, unreviewed, duplicative until its contents are sorted | Extract the images that will actually be used, convert them, place them under `public/assets/…`, then delete the PDF |
| `tez imagz/` | `.PNG` images, contents undetermined | Unknown provenance — may be competitor or stock imagery | Review each file; keep only owner-owned or legally usable images, convert to web formats, place under `public/assets/…` |
| `screenshots/` | QA screenshots from preview checks (`hero-1440.png`, `order-390.png`, …) | Verification output, not source; would add churn on every capture | Keep untracked. Publish-worthy shots can be added to `docs/` deliberately, one at a time |
| `.kilo/` | Local planning/working notes for this repo's editing sessions (e.g. `.kilo/plans/*.md`) | Local tooling state, not part of the storefront | Keep untracked. Anything worth keeping long-term — decisions, rejected approaches — belongs in `claims.md`, `AGENTS.md` or `LAUNCH_BLOCKERS.md` instead |

Rules of thumb before any of this goes into git:

1. Nothing the build doesn't need is committed into `src/` or `public/`. Raw
   material stays outside the repo until it has been curated.
2. Scraped competitor photography is never committed anywhere — see "Claim
   discipline" in `AGENTS.md` and the provenance section of `claims.md`.
3. Photos enter the repo converted and renamed (`.jfif` → `.jpg`), sized for
   the web, under `public/assets/…` — the same way
   `public/assets/product/manual-cured/` was added.
4. Browser-profile and cache folders are never committed, in any folder.

## Why 6 of the 8 "manual cured" images are in the repo but not on the site

All 8 files from `product images/ramp/manual cured/` are committed (renamed
`.jfif` → `.jpg`) under `public/assets/product/manual-cured/`, and the push to
GitHub includes them. Only the two scene photos are displayed — the hero
gallery. The other six bake in text that conflicts with this repo's
single-sourced specs, so they are stored but deliberately not wired into any
section. Full reasoning lives in `claims.md` (section "Manual cured image
set"); the short version:

| Stored file | Why it is not displayed |
|---|---|
| `ramp-spec-infographic-62in.jpg` | States "Ramp Weight: 12 lbs" — `RAMP_SIZES` says 10 lb (and `ramp-detail-10lb-polymer.jpg` itself says 10 lb, so the collage contradicts the set) |
| `ramp-slope-guide.jpg` | "OPTIMAL 18° / MODERATE 23–28°" chart contradicts the computed slope model (`slopeDeg()`) that `claims.md` protects |
| `badge-manufacturer-certified.jpg` | "Manufacturer Certified" — a certification the store cannot evidence; the same class of claim was deleted from the hero artwork in V3 |
| `badge-1-year-warranty.jpg` | "1-year" ≈ the warranty term, but "SATISFACTION GUARANTEED" is not the wording of `GUARANTEE_LABEL` |
| `ramp-detail-10lb-polymer.jpg` | Marketing copy, no slot on the page; adds no spec information beyond `offers.ts` |
| `ramp-scene-side-view.jpg` | Near-verbatim re-render of the reference ramp's marketing art — copyright and Merchant Center imagery risk |

Provenance note: the two displayed photos are Gemini re-renders of real
scenes, not photos of the shipped unit, and their alt text describes the scene
rather than claiming ownership. White-background photography of the actual
product is still owed before a Merchant Center image submit
(`LAUNCH_BLOCKERS.md` #2).
