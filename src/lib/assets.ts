/**
 * Central registry for static assets, content gates and business identity.
 *
 * WHY THIS FILE EXISTS
 * -------------------
 * The storefront must ship without any fabricated content. Sections that need
 * real owner-supplied material (demo video, owner clips, buyer reviews,
 * founder note) are behind explicit boolean gates that default to OFF. With a
 * gate off the section renders nothing — an inert slot, not fake content.
 *
 * ASSET GATE PATTERN
 * ------------------
 *   1. Add a `GATES.<name>` flag here (default false).
 *   2. In the component: `if (!GATES.<name>) return null;`
 *   3. In pages/index.tsx: `{GATES.<name> && <Suspense ...><Component /></Suspense>}`
 *      so a disabled section does not even download its lazy chunk.
 *   4. When the real asset lands: drop it in public/assets/, flip the flag,
 *      and cross the item off LAUNCH_BLOCKERS.md.
 */

/* --------------------------------------------------------------------------
   Static assets — original SVG renderings on a pure white background.
   The owner declined scraping Chewy/PetSafe photography (copyright + the
   brief's own rule 5 + Merchant Center imagery checks). Real photos slot in
   through ASSETS.heroPhotos; see claims.md for the recorded decision.
   -------------------------------------------------------------------------- */

export const ASSETS = {
  /** Product renderings, one per ramp configuration. */
  product: {
    standard: '/assets/product/ramp-compact.svg',
    extended: '/assets/product/ramp-extended.svg',
  },
  /** Trust badges drawn in-house (no third-party endorsement marks). */
  badges: {
    guarantee: '/assets/badges/30-day-guarantee.svg',
    shipping: '/assets/badges/free-shipping.svg',
    secureCheckout: '/assets/badges/secure-checkout.svg',
  },
  /**
   * Owner-supplied photography for the hero gallery (takes precedence over the
   * SVG renderings; see HeroSection). Real scenes re-rendered from the owner's
   * "manual cured" set — provenance and the reason the other six files stay
   * stored-but-unwired are recorded in claims.md.
   */
  heroPhotos: [
    {
      src: '/assets/product/manual-cured/ramp-scene-hound-in-suv.jpg',
      alt:
        'A hound sitting in the open cargo bay of a white SUV with the PawGrip Pro foldable dog ramp deployed from the tailgate',
      label: 'In use',
    },
    {
      src: '/assets/product/manual-cured/ramp-scene-folding-the-ramp.jpg',
      alt:
        'A person folding the PawGrip Pro ramp beside an SUV while a dog waits in the cargo bay',
      label: 'Folds flat',
    },
  ] as readonly { src: string; alt: string; label: string }[],
} as const;

/* --------------------------------------------------------------------------
   Content gates — all OFF until real, verified material exists.
   -------------------------------------------------------------------------- */

export const GATES = {
  /** Product demo video (needs a real clip, not a placeholder). */
  videoProof: false,
  /** Owner-submitted vertical clips (needs real, credited customer videos). */
  ugcGallery: false,
  /** Verified buyer reviews (needs a real review source — see LAUNCH_BLOCKERS). */
  testimonials: false,
  /** Founder note (needs the founder's real text). */
  founderNote: false,
} as const;

/* --------------------------------------------------------------------------
   Business identity — Merchant Center / Google Ads require a real,
   verifiable business on the landing page. Owner-supplied values; the
   Footer's developer banner clears once no field starts with 'REPLACE_'.
   -------------------------------------------------------------------------- */

export const BUSINESS = {
  legalName: 'PawGrip Pro',
  addressLine1: '55 Church St',
  addressLine2: '',
  city: 'New York',
  state: 'NY',
  postalCode: '10007',
  country: 'United States',
  email: 'support@pawgrippro.com',
  phone: '1-800-729-3844',
} as const;

/** True while any required business field is still an unfilled placeholder. */
export const BUSINESS_IS_INCOMPLETE =
  BUSINESS.addressLine1.startsWith('REPLACE_') ||
  BUSINESS.city.startsWith('REPLACE_') ||
  BUSINESS.state.startsWith('REPLACE_') ||
  BUSINESS.postalCode.startsWith('REPLACE_') ||
  BUSINESS.phone.startsWith('REPLACE_');

/**
 * Env-flag deferral for the business identity.
 *
 * Set VITE_REQUIRE_BUSINESS_INFO=true in the host dashboard once the real
 * address/phone are filled in. With the flag ON and any placeholder still
 * present, `vite.config.ts` fails the build (so Netlify cannot deploy a
 * policy-violating site) and the Footer throws a loud render error. With the
 * flag unset — today's state — the build passes and only a developer notice
 * banner shows.
 */
export const REQUIRE_BUSINESS_INFO =
  import.meta.env.VITE_REQUIRE_BUSINESS_INFO === 'true';

/* --------------------------------------------------------------------------
   Founder note — gated placeholder. Inert until GATES.founderNote is true.
   -------------------------------------------------------------------------- */

export const FOUNDER_NOTE = {
  author: 'PLACEHOLDER — founder name',
  role: 'Founder, PawGrip Pro',
  body:
    'PLACEHOLDER — replace with the founder\u2019s own note: why this ramp exists, ' +
    'who it was built for, and what the 30-day trial means to you. Keep it ' +
    'first-person and free of medical claims. This text is inert until ' +
    'GATES.founderNote is enabled in this file.',
} as const;
