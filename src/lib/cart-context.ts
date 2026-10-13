import { createContext, useContext } from 'react';
import type { Cart, CartLine } from './shopify';

export const CART_ID_KEY = 'pet_ramp_cart_id';

export interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  startCheckout: (lines: CartLine[], discountCodes?: string[]) => Promise<Cart>;
  addItem: (merchandiseId: string, quantity?: number, attributes?: { key: string; value: string }[]) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  checkoutUrl: string | null;
  totalQuantity: number;
  subtotal: { amount: string; currencyCode: string };
}

export const CartContext = createContext<CartContextValue | null>(null);

/**
 * Access cart state and actions. Must be used within a CartProvider.
 */
export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}