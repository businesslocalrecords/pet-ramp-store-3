import React from 'react';
import { PawPrint, ShoppingCart } from 'lucide-react';
import { useCart } from '../lib/cart-context';

/**
 * Sticky header. Always visible and pinned to the top (owner request: the
 * previous version stayed hidden until 420px of scroll). Shows the brand plus
 * the live cart count.
 *
 * It occupies flow space (position: sticky) so the static announcement bar
 * that follows it in the DOM sits under the header at rest, then scrolls away
 * beneath the pinned header on scroll.
 *
 * The header carried the offer price in previous versions (first hardcoded
 * $199 / $149, then the live tier price from the shared purchase context) —
 * removed per owner request: the price already lives in the buy box, the
 * size-finder Select buttons and the mobile sticky buy bar, and a price
 * floating over the page read as a discount popup.
 *
 * There is deliberately no CTA button in the header (removed per owner
 * request too): the buy column, the size-finder "Select" buttons and the
 * mobile sticky buy bar already carry every conversion path.
 */
export const StickyHeader: React.FC = () => {
  const { totalQuantity } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-900/10 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-screen-lg items-center justify-between px-4 sm:px-6">
        <a href="#" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-900">
            <PawPrint className="h-5 w-5 text-amber-400" aria-hidden="true" />
          </div>
          <span className="hidden font-extrabold tracking-tight text-stone-900 sm:inline">
            PawGrip Pro
          </span>
        </a>

        {totalQuantity > 0 && (
          <span className="flex items-center gap-1.5 text-sm text-stone-700">
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            {totalQuantity}
          </span>
        )}
      </div>
    </header>
  );
};
