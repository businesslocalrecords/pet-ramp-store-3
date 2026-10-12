/**
 * Single source of truth for every service and policy claim on the site.
 *
 * RULES
 * -----
 * 1. No component, page, meta tag or seeder description may hardcode a policy
 *    number ("30-day", "1-year", "5–7 business days").
 *    Import it from here instead. The verification step greps the repo for
 *    stray policy numbers to prove this rule holds.
 * 2. If a value here changes, `public/` policy pages restate it in plain HTML
 *    (they cannot import TS). Those files carry an HTML comment saying they
 *    mirror this module — update both.
 * 3. Everything here must be a promise the business actually keeps. When in
 *    doubt, choose the conservative value and list the question in
 *    LAUNCH_BLOCKERS.md rather than inflating the claim.
 */

export const POLICY = {
  /** Money-back guarantee window, in days, from delivery. */
  returnDays: 30,
  /** Hardware warranty against manufacturing defects, in months. */
  warrantyMonths: 12,
  /** Whether shipping is free on every order. */
  freeShipping: true,
  /** Delivery window quoted at checkout, for the continental US. */
  deliveryWindow: '5–7 business days',
  /** Support reply-time promise. */
  supportReply: 'within one business day',
  /** Who pays return shipping: 'store' sends a prepaid label. */
  returnShippingPaidBy: 'store',
} as const;

/* --------------------------------------------------------------------------
   Derived labels — use these verbatim in copy so phrasing stays consistent.
   -------------------------------------------------------------------------- */

/** e.g. "30-day" */
export const RETURN_WINDOW_LABEL = `${POLICY.returnDays}-day`;

/** e.g. "12-month" */
export const WARRANTY_LABEL = `${POLICY.warrantyMonths}-month`;

/** e.g. "30-day money-back guarantee" */
export const GUARANTEE_LABEL = `${RETURN_WINDOW_LABEL} money-back guarantee`;

/** e.g. "12-month hardware warranty" */
export const WARRANTY_PRODUCT_LABEL = `${WARRANTY_LABEL} hardware warranty`;

/** e.g. "Free insured shipping on every order" */
export const FREE_SHIPPING_LABEL = POLICY.freeShipping
  ? 'Free insured shipping on every order'
  : 'Shipping calculated at checkout';
