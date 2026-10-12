# LAUNCH_BLOCKERS.md

Everything that must be resolved before paid traffic (Google Ads / PMax /
Meta) can run against this storefront. Each item says where it lives and what
"done" looks like. Items 1–3 are hard blockers; the rest are strongly
recommended before spend.

---

## 1. Business identity — REQUIRED for Merchant Center

**Where:** `BUSINESS` in `src/lib/assets.ts` (currently `REPLACE_WITH_…`
placeholders; the storefront shows a developer notice banner while they are
unfilled).

**Why:** Google Merchant Center and Ads require a real, verifiable business
identity on the landing page. A fake address is worse than a missing one.

**How it is enforced (env-flag deferral):**
- Today the flag is unset, so `npm run build` passes and the banner shows.
- When ready, set `VITE_REQUIRE_BUSINESS_INFO=true` in the Netlify dashboard.
  With the flag ON and any placeholder still present, `vite.config.ts`
  **fails the build**, and the Footer throws a loud render error.
- Fill in: street address, suite/unit, city, state, ZIP, phone.

**Done when:** `BUSINESS_IS_INCOMPLETE` is `false` and the footer renders the
real address.

## 2. Real product photography

**Where:** `ASSETS.product.*` and `ASSETS.heroPhotos` in `src/lib/assets.ts`.

**Why:** Google Merchant Center accepts only raster images (BMP, GIF, JPEG,
PNG, WebP, TIFF) — the shipped SVG renderings are web placeholders, not
submittable product images. Owner declined scraping Chewy/PetSafe photos
(copyright, the brief's rule 5, Merchant Center imagery checks); recorded in
`claims.md`.

**Progress:** `ASSETS.heroPhotos` now carries two real scenes from the owner's
Gemini-cured set (`public/assets/product/manual-cured/`), so the hero gallery
shows photography instead of renderings alone. Six more files from that set are
stored but deliberately unwired (baked-in claims that conflict with the
single-sourced specs — see claims.md). The stored set is **not** a substitute
for product-feed imagery: it re-renders the reference ramp, not the shipped
unit, so `ASSETS.product.*` still shows the SVG renderings.

**Done when:** `heroPhotos` contains at least one real owner photo and the
product renderings are replaced by white-background photos of the actual
ramp (both configurations), with `alt` text in `HeroSection`.

## 3. Purchase conversion tracking (Shopify Customer Events)

**Where:** Shopify Admin → Settings → Customer events → Add custom pixel.
`src/lib/analytics.ts` documents why this cannot live in the app.

**Why:** with headless checkout the thank-you page is on Shopify's checkout
domain, so this React app never loads after payment. `trackPurchase` and
`pushPurchaseCompleteDataLayer` were deleted (they could never run); the
pixel must subscribe to `checkout_completed` and push `purchase` to
dataLayer / gtag / fbq.

**Done when:** a completed test order appears as a `purchase` conversion in
GA4 / Google Ads / Meta.

## 4. Supplier spec-sheet confirmation

**Where:** `RAMP_SIZES` in `src/lib/offers.ts` (surface material, feet,
assembly, folded dimensions, actual weight) and the seeder's variant data.

**Open questions:**
- Extended (70″) ramp **weight** — unknown; `rampWeightLb` is `null` and the
  UI hides the number rather than guessing.
- Walking-surface material (what "textured" actually is).
- Feet material/compound.
- Assembly state on arrival.
- Folded dimensions for both sizes (currently the published 31″ / 35″).

**Done when:** the values match the supplier's spec sheet; `rampWeightLb` is
filled in.

## 5. Real reviews → Testimonials gate

**Where:** `GATES.testimonials` in `src/lib/assets.ts`.

**Why:** the gate is OFF because there is no review source. FTC and
ad-network rules prohibit invented reviews; `index.html` also carries no
`aggregateRating` for the same reason.

**Done when:** a real review source (Judge.me / Shopify Product Reviews /
manual) is wired in, the JSON-LD `aggregateRating` is restored from real
data, and the gate is flipped.

## 6. Real demo video → VideoProof gate

**Where:** `GATES.videoProof`. The section's copy ("Rocky", "2 min 15 s",
"26° slope") is placeholder narrative.

**Done when:** a real 15–30 s clip (H.264, < 10 MB, captions) is in
`public/assets/`, the copy matches what the video shows, and the gate flips.

## 7. Owner UGC → UGCGallery gate

**Where:** `GATES.ugcGallery`.

**Done when:** genuine, credited customer clips exist and the slot fields are
filled with real handles/filenames.

## 8. Founder note → FounderNote gate

**Where:** `GATES.founderNote` + `FOUNDER_NOTE` in `src/lib/assets.ts`.

**Done when:** the founder's real note replaces the placeholder text (the
placeholder literally says "PLACEHOLDER" so it cannot leak unnoticed).

## 9. About page story

**Where:** `public/about/index.html` (HTML comment marks the paragraph).

**Done when:** the generic "Why this exists" copy is replaced with the real
story — no invented founding date, customer counts, or credentials.

## 10. Analytics IDs

**Where:** `.env.local` / Netlify env: `VITE_GA_MEASUREMENT_ID`,
`VITE_GOOGLE_ADS_CONVERSION_ID`, `VITE_META_PIXEL_ID` (all empty in
`.env.example`).

**Done when:** the IDs are set in Netlify and a redeploy shows events landing
(page views already fire; `size_finder_used` / `faq_open` / `lead_submit` /
`tester_apply` are wired).

## 11. Seeder live run

**Where:** `scripts/shopify-seed.mjs` (dry-run reviewed — it reports
"would publish 3 of 5 product(s)"; `orthopedic-foam-bed-steps` and
`advanced-hip-joint-soft-chews` stay DRAFT).

**Why:** the live store still carries the old tether title and has no
Extended (70″) variant, which the new size finder and buy box expect.

**Done when:** the owner runs `npm run shopify:seed` (mutates live data),
then `npm run shopify:verify` confirms:
- tether title = "Adjustable Car Safety Tether" (handle unchanged),
- hero ramp has `Standard (62")` and `Extended (70")` variants,
- chews + bed steps are DRAFT,
- compare-at prices intact.

## 12. Terms: governing law

**Where:** `public/terms/index.html` — the governing-law clause is generic
("the state in which the business is registered").

**Done when:** the clause names the actual state.

## 13. Support reply time

**Where:** `POLICY.supportReply` in `src/lib/policy.ts` ("within one
business day" — the conservative default).

**Done when:** the owner confirms the promise the business can actually keep.

## 14. Payment methods strip

**Where:** `TrustBadges.tsx` payment list (Shop Pay, Apple Pay, PayPal, …).

**Done when:** the list matches the payment providers actually enabled in
Shopify Settings → Payments.
