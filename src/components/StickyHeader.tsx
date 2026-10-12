import React, { useState, useEffect } from 'react';
import { PawPrint, ShoppingCart } from 'lucide-react';
import { useCart } from '../lib/cart-context';
import { usePurchase } from '../lib/purchase-context';
import { formatMoney, money } from '../lib/offers';

/**
 * Sticky header. Appears on scroll; pairs the brand with the LIVE offer price
 * from the shared purchase context — the old version hardcoded $199 / $149,
 * which contradicted offers.ts the moment pricing changed.
 *
 * There is deliberately no CTA button in the header (removed per owner
 * request): the buy column, the size-finder "Select" buttons and the mobile
 * sticky buy bar already carry every conversion path.
 */
export const StickyHeader: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const { totalQuantity } = useCart();
  const { tier, rampSize, rampPrice } = usePurchase();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 420);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const compareAt = money(tier.compareAt + rampSize.priceDelta);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 border-b border-gray-900/10 bg-white/90 backdrop-blur-xl transition-transform duration-300 ${
        scrolled ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-screen-lg items-center justify-between px-4 sm:px-6">
        <a href="#" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-900">
            <PawPrint className="h-5 w-5 text-amber-400" aria-hidden="true" />
          </div>
          <span className="hidden font-extrabold tracking-tight text-stone-900 sm:inline">
            PawGrip Pro
          </span>
        </a>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-stone-400 line-through md:inline">
            ${formatMoney(compareAt)}
          </span>
          <span className="hidden font-bold text-stone-900 md:inline">${formatMoney(rampPrice)}</span>

          {totalQuantity > 0 && (
            <span className="flex items-center gap-1.5 text-sm text-stone-700">
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              {totalQuantity}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
