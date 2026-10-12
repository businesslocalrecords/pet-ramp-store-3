import React, { useState } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { Byline } from './Byline';
import { readDkiParams } from '../lib/dki';
import { ASSETS } from '../lib/assets';
import { RETURN_WINDOW_LABEL, WARRANTY_LABEL } from '../lib/policy';

interface GalleryFrame {
  src: string;
  alt: string;
  label: string;
  /** 'contain' shows the whole image (no crop) — see ASSETS.heroPhotos. */
  fit?: 'cover' | 'contain';
}

/**
 * Fallback gallery frames — the original SVG renderings from
 * public/assets/product/ (white background — Merchant Center friendly).
 * Used only when ASSETS.heroPhotos is empty; it currently carries the
 * owner's revised six-photo set. Provenance per frame is recorded in
 * claims.md.
 */
const FALLBACK_FRAMES: GalleryFrame[] = [
  {
    src: ASSETS.product.standard,
    alt: 'Compact 62-inch configuration of the PawGrip Pro foldable dog car ramp, side view',
    label: 'Compact \u00b7 62\u2033',
  },
  {
    src: ASSETS.product.extended,
    alt: 'Extended 70-inch configuration of the PawGrip Pro foldable dog car ramp, side view',
    label: 'Extended \u00b7 70\u2033',
  },
];

/**
 * Hero editorial block: honest byline, DKI headline (whitelisted values
 * only — see lib/dki.ts), and a product gallery.
 *
 * REMOVED IN V3 (were fabricated and violated ad-network policy):
 *   - the 4.9 / 2,847-review star row and "96% would buy again" stat
 *   - the "24–28° joint-safe slope" vet-style claim. The slope is now shown
 *     honestly and computed live: about 20–25° at typical SUV heights,
 *     derived in lib/offers.ts (slopeDeg) and surfaced in the SizeGuide.
 *
 * The purchase UI lives in the sticky right-hand column (see BuyBox).
 */
export const HeroSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  // Read once on mount. This is a client-only SPA, so there is no hydration
  // mismatch to guard against.
  const [dki] = useState(() => readDkiParams());

  const ownerFrames: GalleryFrame[] = ASSETS.heroPhotos.map((photo) => ({
    src: photo.src,
    alt: photo.alt,
    label: photo.label,
    fit: photo.fit,
  }));
  const frames: GalleryFrame[] =
    ownerFrames.length > 0 ? ownerFrames : FALLBACK_FRAMES;
  const active = frames[Math.min(activeIndex, frames.length - 1)];

  return (
    <section id="hero" className="scroll-mt-24">
      {/* Editorial byline */}
      <Byline />

      {/* DKI headline — values are whitelisted, never raw URL input */}
      <h1 className="mt-5 text-[2rem] leading-[1.08] font-extrabold text-stone-900 sm:text-[2.6rem] lg:text-[3rem]">
        The <span className="text-blue-700">{dki.vehiclePhrase}</span>
        <br />
        {dki.locationPhrase}
      </h1>

      <p className="mt-4 max-w-xl text-[1.0625rem] text-stone-600">
        Stop lifting a 90 lb dog into your {dki.vehicleInline}. The PawGrip Pro turns
        the jump into a walk up a gentle slope &mdash; about 20&ndash;25&deg; at typical
        SUV heights &mdash; with a high-traction deck and side rails so nervous dogs
        step in on their own {dki.locationInline}.{' '}
        {dki.breedPhrase.charAt(0).toUpperCase() + dki.breedPhrase.slice(1)}.
      </p>

      {/* Gallery */}
      <div className="mt-7">
        {/* Main frame */}
        <div className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-stone-900/10">
          <div className="aspect-[3/2]">
            <img
              key={active.src}
              src={active.src}
              alt={active.alt}
              width={1200}
              height={800}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className={`h-full w-full bg-white ${
                active.fit === 'contain' ? 'object-contain' : 'object-cover'
              }`}
            />
          </div>

          {/* Frame label */}
          <span className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-stone-700 ring-1 ring-stone-900/10">
            {active.label}
          </span>

          {/* In-image assurance strip — all values from lib/policy.ts */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-5 bg-gradient-to-t from-stone-900/70 to-transparent px-4 py-3.5 text-[11px] font-semibold text-white">
            <span className="flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> {RETURN_WINDOW_LABEL}{' '}
              returns
            </span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> {WARRANTY_LABEL}{' '}
              warranty
            </span>
          </div>
        </div>

        {/* Thumbnails */}
        <div
          className="hide-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Product images"
        >
          {frames.map((frame, idx) => (
            <button
              key={frame.src + idx}
              role="tab"
              aria-selected={idx === activeIndex}
              aria-label={frame.alt}
              onClick={() => setActiveIndex(idx)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-1 transition-all duration-200 ${
                idx === activeIndex ? 'ring-2 ring-blue-600' : 'ring-stone-900/10 hover:ring-stone-900/20'
              }`}
            >
              <img
                src={frame.src}
                alt=""
                width={160}
                height={160}
                loading="lazy"
                decoding="async"
                className="h-full w-full bg-white object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
