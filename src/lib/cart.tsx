import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { createCart, addToCart, getCart, updateCartLines, removeFromCart, type Cart, type CartLine } from './shopify';
import { CartContext, CART_ID_KEY, type CartContextValue } from './cart-context';

/**
 * Global cart provider.
 * Persists the Shopify cart ID to localStorage so carts survive page reloads.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    const storedCartId = localStorage.getItem(CART_ID_KEY);
    if (storedCartId) {
      const existingCart = await getCart(storedCartId).catch(() => null);
      if (existingCart) {
        setCart(existingCart);
        setLoading(false);
        return;
      }
      localStorage.removeItem(CART_ID_KEY);
    }
    const newCart = await createCart();
    localStorage.setItem(CART_ID_KEY, newCart.id);
    setCart(newCart);
    setLoading(false);
  }, []);

  // Hydrate or create the cart on mount (async, so no cascading render).
  useEffect(() => {
    loadCart().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Failed to initialize cart');
      setLoading(false);
    });
  }, [loadCart]);

  const refreshCart = useCallback(async () => {
    const storedCartId = localStorage.getItem(CART_ID_KEY);
    if (storedCartId) {
      try {
        const existingCart = await getCart(storedCartId);
        if (existingCart) {
          setCart(existingCart);
          return;
        }
        localStorage.removeItem(CART_ID_KEY);
      } catch {
        localStorage.removeItem(CART_ID_KEY);
      }
    }
    await loadCart();
  }, [loadCart]);

  const startCheckout = useCallback(async (lines: CartLine[], discountCodes: string[] = []) => {
    setLoading(true);
    setError(null);
    try {
      const checkoutCart = await createCart(lines, discountCodes);
      localStorage.setItem(CART_ID_KEY, checkoutCart.id);
      setCart(checkoutCart);
      return checkoutCart;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create checkout cart');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback<CartContextValue['addItem']>(
    async (merchandiseId, quantity = 1, attributes) => {
      let currentCart = cart;
      if (!currentCart) {
        await loadCart();
        const storedCartId = localStorage.getItem(CART_ID_KEY);
        if (storedCartId) {
          currentCart = await getCart(storedCartId);
        }
        if (!currentCart) {
          throw new Error('Unable to initialize cart. Please refresh and try again.');
        }
      }

      setLoading(true);
      setError(null);
      try {
        const lines: CartLine[] = [{ merchandiseId, quantity, attributes }];
        const updatedCart = await addToCart(currentCart.id, lines);
        setCart(updatedCart);

        // Google Ads / GA4 AddToCart
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'add_to_cart', {
            currency: updatedCart.cost.totalAmount.currencyCode,
            value: parseFloat(updatedCart.cost.totalAmount.amount),
            items: [{ item_id: merchandiseId, quantity, price: parseFloat(updatedCart.cost.totalAmount.amount) / quantity }],
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add to cart');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [cart, loadCart]
  );

  const updateQuantity = useCallback<CartContextValue['updateQuantity']>(
    async (lineId, quantity) => {
      if (!cart) return;
      setLoading(true);
      setError(null);
      try {
        setCart(await updateCartLines(cart.id, [{ id: lineId, quantity }]));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update cart');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [cart]
  );

  const removeItem = useCallback<CartContextValue['removeItem']>(
    async (lineId) => {
      if (!cart) return;
      setLoading(true);
      setError(null);
      try {
        setCart(await removeFromCart(cart.id, [lineId]));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove item');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [cart]
  );

  const clearCart = useCallback(async () => {
    localStorage.removeItem(CART_ID_KEY);
    await loadCart();
  }, [loadCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        startCheckout,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
        checkoutUrl: cart?.checkoutUrl ?? null,
        totalQuantity: cart?.totalQuantity ?? 0,
        subtotal: cart?.cost.subtotalAmount ?? { amount: '0', currencyCode: 'USD' },
      }}
    >
      {children}
    </CartContext.Provider>
  );
}