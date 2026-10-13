import React from 'react';
import { usePurchase } from '../lib/purchase-context';
import { formatMoney, bundleSavings, PRODUCT_NAMES, RAMP_SIZES, RAMP_VARIANT_MATCHERS } from '../lib/offers';
import { POLICY, GUARANTEE_LABEL, WARRANTY_PRODUCT_LABEL } from '../lib/policy';
import { TieredOfferSelector } from './TieredOfferSelector';
import { OrderBump } from './OrderBump';
import { TetherUpsell } from './TetherUpsell';
import { FlatBuyButton } from './FlatBuyButton';
import { TrustBlock } from './TrustBlock';

/**
 * Sticky right-hand purchase column (presentational).
 *
 * All state and side-effects live in PurchaseProvider, so this component and
 * the mobile buy bar stay perfectly in sync.
 *
 * DESIGN: "big-box retailer" register. Sharp 1px borders, rounded-md at most,
 * flat high-contrast action colour, dense tabular layout. The emotional DTC
 * styling stops at this component's edge — the editorial column keeps it.
 *
 * V3 CHANGES
 * ----------
 * - The fabricated rating row (4.9 stars, "2,847 reviews") is gone. Reviews
 *   return through the gated Testimonials section once a real review source
 *   exists (see LAUNCH_BLOCKERS.md).
 * - A size row makes the SizeGuide's choice visible: picking "Extended" in the
 *   finder selects the 70″ variant and adds its $40 delta to the live total.
 * - The bottom assurance line is sourced from lib/policy.ts.
 */
export const BuyBox: React.FC = () => {
  const {
    tier,
    selectedId,
    selectTier,
    rampSize,
    setRampSize,
    rampVariants,
    bumpEnabled,
    setBumpEnabled,
    bumpPrice,
    showBump,
    tetherUpsell,
    setTetherUpsell,
    tetherPrice,
    showTetherUpsell,
    total,
    loading,
    ready,
    matVariant,
    tetherVariant,
    stock,
    buying,
    error,
    buy,
  } = usePurchase();

  const savingsPercent = Math.round((1 - tier.price / tier.compareAt) * 100);
  const bundleSave = bundleSavings(tier);

  /**
   * Sizes the loaded Shopify variants can actually fulfil. A size without a
   * matching variant is DISABLED, never silently substituted — the Extended
   * carries a $40 delta and charging it for a Standard variant would be
   * dishonest.
   */
  const variantsLoaded = rampVariants.length > 0;
  const sizeAvailable = (sizeId: string): boolean => {
    if (!variantsLoaded) return false;
    return rampVariants.some(
      (v) => RAMP_VARIANT_MATCHERS[sizeId].test(v.title) && v.availableForSale
    );
  };
  const extendedAvailable = sizeAvailable('extended');
  const anyRampAvailable = rampVariants.some((variant) => variant.availableForSale);

  return (
    <div>
      {/* Product identity — compact, catalog-style */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold leading-tight text-gray-900">{PRODUCT_NAMES.ramp}</h2>
      </div>

      {/* Sharp header — stock status in Chewy-order green */}
      <div className="flex items-end justify-between border-b border-gray-200 py-4">
        <h3 className="text-lg font-bold tracking-tight text-gray-900">Select Package</h3>
        {variantsLoaded && !anyRampAvailable ? (
          <span className="text-sm font-bold text-red-700">Out of stock</span>
        ) : stock !== null && stock > 0 ? (
          <span className="text-sm font-bold text-[#008C3A]">
            {stock < 20 ? `Only ${stock} left` : 'In Stock'}
          </span>
        ) : anyRampAvailable ? (
          <span className="text-sm font-bold text-[#008C3A]">Available</span>
        ) : (
          <span className="text-sm font-medium text-gray-500">Checking availability</span>
        )}
      </div>

      {!ready ? (
        <div className="flex items-center gap-2 py-8 text-sm text-gray-500">
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700"
            aria-hidden="true"
          />
          Loading pricing&hellip;
        </div>
      ) : (
        <div className="pt-4">
          {/* Size row — mirrors the SizeGuide's selection */}
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
            Size{' '}
            <a href="#size-guide" className="font-medium normal-case tracking-normal text-blue-700 underline">
              Not sure? Use the size finder
            </a>
          </p>
          <div className="mb-4 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Ramp size">
            {RAMP_SIZES.map((size) => {
              const isActive = rampSize.id === size.id;
              const available = sizeAvailable(size.id);
              return (
                <button
                  key={size.id}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  aria-disabled={!available}
                  disabled={!available}
                  onClick={() => setRampSize(size.id)}
                  className={`flex min-h-12 flex-col justify-center rounded-md border px-3 py-2 text-left transition-colors ${
                    isActive
                      ? 'border-blue-700 bg-blue-50/60'
                      : available
                        ? 'border-gray-300 bg-white hover:bg-gray-50'
                        : 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <span className={`text-[0.8125rem] font-bold ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                    {size.name} &middot; {size.lengthIn}&Prime;
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {size.weightCapacityLb} lb rated
                    {size.priceDelta > 0 && (
                      <span className="font-semibold text-gray-700"> &middot; +${formatMoney(size.priceDelta)}</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
          {!extendedAvailable && (
            <p className="mb-3 text-[11px] font-medium text-gray-500">
              The Extended (70&Prime;) is temporarily out of stock &mdash; the Compact is available
              now. Email us and we will tell you the moment the Extended is back.
            </p>
          )}

          <TieredOfferSelector
            selectedId={selectedId}
            onSelect={selectTier}
            disabled={rampVariants.length === 0}
          />

          {/* Add-ons — both render as integrated rows, not floating boxes */}
          {(showBump || showTetherUpsell) && (
            <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-gray-500">
              Frequently bought together
            </p>
          )}

          {showBump && (
            <OrderBump
              matVariantId={matVariant?.id ?? null}
              enabled={bumpEnabled}
              onToggle={setBumpEnabled}
              price={bumpPrice}
            />
          )}

          {showTetherUpsell && (
            <TetherUpsell
              available={Boolean(tetherVariant)}
              enabled={tetherUpsell}
              onToggle={setTetherUpsell}
              price={tetherPrice}
            />
          )}

          {/* Total — dense, receipt-like */}
          <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3">
            <span className="text-sm text-gray-700">
              Total
              {bumpEnabled && matVariant && <span className="ml-1 text-xs text-gray-400">incl. mat</span>}
            </span>
            <span className="text-xl font-bold text-gray-900">${formatMoney(total)}</span>
          </div>

          <FlatBuyButton
            price={total}
            loading={buying || loading}
            disabled={!sizeAvailable(rampSize.id)}
            onClick={buy}
          />

          {error && (
            <p role="alert" className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <p className="mt-3 text-center text-xs text-gray-500">
            {bundleSave > 0
              ? `Save $${formatMoney(bundleSave)} vs buying separately \u00b7 `
              : `Save ${savingsPercent}% today \u00b7 `}
            {POLICY.freeShipping ? 'Free insured shipping' : 'Shipping calculated at checkout'} &middot;{' '}
            {GUARANTEE_LABEL} &middot; {WARRANTY_PRODUCT_LABEL}
          </p>

          <TrustBlock />
        </div>
      )}
    </div>
  );
};
