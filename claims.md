# claims.md — Claim Audit & Rewordings

Every claim on this storefront, where it came from, and what happened to it.
This is the record that proves the V3 overhaul removed unverifiable content
rather than quietly reworded it. If you are about to add a claim, add a row
here first.

## The rules

1. **No claim without a source.** Specifications, policy numbers and prices
   live in `src/lib/offers.ts` / `src/lib/policy.ts` and are single-sourced.
2. **No invented social proof.** No star ratings, review counts, "94% of
   customers", customer counts, or vet/medical endorsements that the store
   cannot produce.
3. **No medical claims.** The ramp is described with physics and specs
   (slope angles, published weight ratings); health outcomes are deferred to
   the visitor's veterinarian.
4. **Real compare-at prices only.** A strikethrough price must be one the
   store has actually charged.

## Approved price-display decision (owner)

The original brief asked to strip all compare-at prices. The owner decided to
**keep them as a subtle anchor** instead:

- The compare-at price renders muted and small (`text-xs text-gray-400
  line-through`) in `TieredOfferSelector` — it anchors value without reading
  like discount-warehouse pricing.
- "Save $x vs buying separately" is computed live
  (`bundleSavings()` in `offers.ts`) and renders **only when genuinely
  positive**.
- Every compare-at in `offers.ts` is a real, previously charged price.

## Rewording table

| Where | Old claim | Why it had to go | What it says now |
|---|---|---|---|
| `index.html` JSON-LD | `aggregateRating` 4.9 / 2,847 | Fabricated ratings; Google rich-result & Merchant Center policy reject invented review markup | Removed. Returns only when a real review source exists (LAUNCH_BLOCKERS #5) |
| `index.html` meta/JSON-LD | "vet-approved", "fits any vehicle", `price: "149"` | Unverifiable; false for the 150 lb Compact; stale price | "rated to 150 lb (Compact) or 250 lb (Extended)", `price: "79.99"` matching `DEFAULT_TIER_ID` |
| `HeroSection` | "4.9 stars · 2,847 reviews", "96% would buy again" | Invented review stats | Removed; reviews live behind `GATES.testimonials` |
| `HeroSection` | "24–28° joint-safe slope" | Vet-style medical claim; the real angles depend on vehicle height | "about 20–25° at typical SUV heights", computed by `slopeDeg()` and shown live in the SizeGuide |
| `AdvertorialHeader` | Fake "Advertisement — Lifestyles" editorial shell + fabricated vet author | The page is a product page, not an advertorial | Component deleted |
| `AuthorByline` → `Byline` | "Dr. Sarah Jenkins, DVM — medically reviewed" | Invented veterinarian and medical review | "By the PawGrip Pro team" + last-updated stamp |
| `UrgencyBar` → `AnnouncementBar` | "RAMP20 — 20% off", countdown, stock scraped from the nonexistent `dog-car-ramp` handle | Coupon no longer exists; the stock call never resolved (dead code — real handle is `premium-foldable-dog-car-ramp`) | Static bar: free insured shipping, 30-day money-back guarantee, 12-month hardware warranty (all from `policy.ts`) |
| `FeatureBento` → `Benefits` | "Vet-Approved Slope", "eliminates the 3–4× body-weight impact" | Medical claims | "A gentle, computed slope" with the real angles (23° / 20° at 24″) |
| `TrustBadges` | "Vet Approved" badge + `vet-approved.svg` | No veterinary endorsement exists | Badge and SVG deleted; three in-house badges remain |
| `hero-ramp.svg` | Floating "Vet Approved / Tested & certified 250 lb / 26° slope" cards baked into the hero image | Unverifiable claims in artwork; 250 lb wrong for the Compact | File deleted; replaced by original product renderings in `public/assets/product/` |
| `FAQ` | "94% of customers report…", "veterinarians recommend", "static-tested beyond 500 lbs", "2× safety margin" | Invented statistics | Spec-based answers; senior-dog question defers to the visitor's veterinarian |
| `FAQ` | "ships same business day… 2–5 business days… Canada and UK at checkout" | International shipping not set up | Policy values from `policy.ts`; continental US only |
| `ComparisonTable` | "PawGrip Pro vs. Cheap Knockoffs" with unverifiable competitor claims | Cannot assert what competitors' products do | Compact / Extended / Lifting / Jumping, with an honest-limitation row and a buyer's checklist |
| `Tiers` perks | "100-day money-back guarantee" | Policy is 30 days | `30-day money-back guarantee` (from `policy.ts`) |
| `TrustBlock` | "100-Day Trial", "covered for as long as you own it" | Wrong window; lifetime claim | 30-day trial; 12-month hardware warranty |
| `index.tsx` | "Lifetime hardware warranty" | No lifetime warranty exists | `WARRANTY_PRODUCT_LABEL` (12-month) |
| `Footer` | "Join 12,000+ owners", "Lifetime hardware warranty", dead social links | Invented customer count; false warranty term; links went nowhere | Removed; policy-sourced labels; links to real policy pages |
| `TetherUpsell` | "Crash-Tested Car Safety Tether" | "Crash-tested" overstated what the store can evidence (owner decision) | "Adjustable Car Safety Tether" — Shopify handle unchanged (`crash-tested-adjustable-car-safety-tether`) |
| `StickyHeader` | Hardcoded `$199 / $149` | Contradicted `offers.ts` | Live tier price + compare-at from the purchase context |
| Seeder hero copy | "rated by 2,800+ owners", "94% within 24 hours", "vet-approved", "Made in the USA", "100-day guarantee card" | Invented proof + unverifiable origin | Published specifications + the real 30-day/12-month policy |
| Seeder chews | "Vet Formulated", "formulated with veterinarians", "Made in the USA" | Unverifiable claims on a regulated category (product also unpublished) | "Advanced Hip & Joint Soft Chews", spec-only copy |
| Testimonials / VideoProof / UGCGallery | Entire sections | Placeholder narrative presented as real customers/video | `return null` behind `GATES` (asset-gate pattern in `src/lib/assets.ts`) |
| `HeroSection` hero gallery | SVG-only renderings | Owner supplied real photography from the "manual cured" set | Two scene photos wired through `ASSETS.heroPhotos` with descriptive alt text; the SVG renderings remain the fallback |
| `ASSETS.heroPhotos` alt text | Generic "PawGrip Pro owner photo N" | Alt text must describe the image — implying ownership would be invented social proof (rule 2) | Descriptive alt per photo ("A hound sitting in the open cargo bay…") |
| `index.html` preload / og:image / JSON-LD image | `ramp-compact.svg` | SVG is not a renderable social/raster image, and it is no longer the hero's first frame once `heroPhotos` is populated | `/assets/product/manual-cured/ramp-scene-hound-in-suv.jpg` (the new first hero frame) |
| `SizeGuide` heading + intro | "Find the right size for your vehicle" + computed-slope explanation | Owner instruction: lead with the Compact's popularity and explain the practical difference in plain language, not degrees | "Most owners pick the 62″ Compact" + practical fit copy (see the owner-attested popularity row below) |
| `SizeGuide` degree math | Live slope readout ("22.8° / 20.1°"), per-card "Slope at {height}″" rows, the slope-by-cargo-height chart table and the degree-labelled ramp diagram | Owner instruction: shoppers decide on fit, not trigonometry | Practical specs only (capacity, ramp weight, open/folded size, best-for vehicles); `slopeDeg()` now feeds only the `trackSizeFinderUsed` analytics payload |
| `SizeGuide` trust bar | "30-Day Risk-Free Trial / Insured Shipping / Hassle-Free Returns" panel under the finder | Owner instruction: redundant with the announcement bar, the buy box's assurance row and trust block, the ShippingReturns section and the footer | Panel deleted; every policy value is still shown at least once elsewhere |
| `TrustBadges` | Whole "Shop With Total Confidence" section (three in-house badges + payment strip) | Owner instruction: redundant with the same trust claims elsewhere on the page | Section removed from `pages/index.tsx`; badge SVGs remain in `public/assets/badges/` for future use |

## "Manual cured" image set — provenance and what is deliberately not displayed

The owner's `product images/ramp/manual cured/` folder holds 8 Gemini-generated
images produced from scraped Chewy/PetSafe reference photography
(`product images/ramp/PetSafe …/`). All 8 are committed to
`public/assets/product/manual-cured/` (renamed `.jfif` → `.jpg` — identical JPEG
bytes, avoids MIME ambiguity on the static host). Only the two real scenes are
displayed, in the hero gallery. The other six bake in text that conflicts with
the single-sourced specs or the V3 claim clean-up, so they stay stored but
unwired until the underlying conflicts are resolved:

| Stored file | Why it is not displayed |
|---|---|
| `ramp-spec-infographic-62in.jpg` | States "Ramp Weight: 12 lbs"; `RAMP_SIZES[0].rampWeightLb` is 10 lb (and `ramp-detail-10lb-polymer.jpg` says 10 lb — the collage contradicts the set itself) |
| `ramp-slope-guide.jpg` | "OPTIMAL 18° / MODERATE (23–28°)" contradicts the computed slope model in `offers.ts`'s `slopeDeg()` (22.8° / 20.1° at 24″) — see the "24–28° joint-safe slope" row above |
| `badge-manufacturer-certified.jpg` | "Manufacturer Certified" / "Certified pet safe materials" is a certification the store cannot evidence; the same class of claim was deleted from `hero-ramp.svg` in V3 |
| `badge-1-year-warranty.jpg` | "1-year" ≈ `POLICY.warrantyMonths` but "SATISFACTION GUARANTEED" is not the wording of `GUARANTEE_LABEL` ("30-day money-back guarantee"); the same policy wording already runs in the announcement bar, the buy box and the footer |
| `ramp-detail-10lb-polymer.jpg` | Marketing copy ("Featherlight", "sturdy polymer construction", "10 LB") with no clean slot; no new spec information beyond `offers.ts` |
| `ramp-scene-side-view.jpg` | Near-verbatim re-render of the reference ramp's marketing art; using it as product imagery risks Merchant Center imagery rejection and copyright |

Provenance honesty note: the two displayed photos are Gemini re-renders of real
scenes, not photos of the shipped unit; alt text describes the scene rather than
claiming ownership. White-background photography of the actual product is still
owed before a Merchant-Center image submit (LAUNCH_BLOCKERS #2).

## Deliberately kept (and why)

| Claim | Justification |
|---|---|
| `$79.99 / $139.99` compare-at | Real pricing decision; see "Approved price-display decision" above |
| "150 lb / 250 lb rated" | Published ratings for the two published sizes; confirm against the supplier spec sheet (LAUNCH_BLOCKERS #3) |
| "62″ / 70″ unfolded, 31″ / 35″ folded" | Published dimensions in the size finder and catalog |
| Slope table (22.8° / 20.1° at 24″) | Arithmetic on the published dimensions: `asin(height / length)` because the ramp is the hypotenuse — kept in the hero's "about 20–25°" line and the size-finder analytics payload; removed from the size-finder UI per the owner instruction above |
| "Most owners pick the 62″ Compact … almost every customer who buys one is happy with it" | Owner-attested popularity claim (owner instruction for the size finder). Qualitative — deliberately no percentages or review counts. Owner should sanity-check it against Shopify variant sales before scaling paid traffic; if the Compact is not in fact the top seller, soften the heading back to "Find the right size for your vehicle" |
| Size-finder slider help text | "Slide the measure of ground-to-bumper height and we will pick auto-select the best size for you." | Owner instruction: explain the picking mechanism instead of restating the height verdict in prose | Static explainer (exact owner wording); the matching card is highlighted live (border + dog icon), and both Select buttons write the shared purchase context |
| "rubber, non-slip feet", "textured deck", "side rails" | Published product features |
| "Ships within 1 business day (before 2pm), 2–5 business day delivery" | Store policy in `policy.ts`; confirm operationally (LAUNCH_BLOCKERS) |
