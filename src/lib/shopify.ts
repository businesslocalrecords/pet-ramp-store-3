/**
 * Shopify Storefront API client.
 *
 * Environment variables (add to a .env file, DO NOT commit):
 *   VITE_SHOPIFY_STOREFRONT_DOMAIN  e.g. pet-ramp-store.myshopify.com
 *   VITE_SHOPIFY_STOREFRONT_TOKEN   storefront access token from Shopify Admin
 *
 * Get a token at: Shopify Admin > Online Store > Domains > Storefront API
 * access tokens > Create token > scopes: unauthenticated_read_products,
 * unauthenticated_read_checkout
 */
const DOMAIN = import.meta.env.VITE_SHOPIFY_STOREFRONT_DOMAIN!;
const TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN!;
const API_VERSION = '2025-10'; // current Storefront API GraphQL version

export interface ProductVariantEdge {
  node: {
    id: string;
    title: string;
    price: { amount: string; currencyCode: string };
    availableForSale: boolean;
    selectedOptions: { name: string; value: string }[];
    quantityAvailable: number | null;
  };
}

export interface ProductImage {
  url: string;
  altText: string;
}

/** A single purchasable product variant. */
export type Variant = ProductVariantEdge['node'];

export interface ProductEdge {
  node: {
    id: string;
    title: string;
    handle: string;
    description: string;
    descriptionHtml: string;
    variants: { edges: ProductVariantEdge[]; totalCount: number };
    featuredImage?: ProductImage;
    images?: { edges: { node: ProductImage }[] };
    availableForSale: boolean;
    priceRange: {
      minVariantPrice: { amount: string; currencyCode: string };
      maxVariantPrice: { amount: string; currencyCode: string };
    };
    onlineStoreUrl?: string;
  };
}

/**
 * Fetch all products from the Shopify store.
 */
export async function fetchProducts(): Promise<ProductEdge['node'][]> {
  const query = `
    query ShopifyProducts {
      products(first: 10, sortKey: CREATED_AT, directions: DESC) {
        edges {
          node {
            id
            title
            handle
            description
            descriptionHtml
            availableForSale
            variants(first: 250) {
              edges {
                node {
                  id
                  title
                  price { amount currencyCode }
                }
              }
            }
            featuredImage {
              url
              altText
            }
            images(first: 10) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            priceRange {
              minVariantPrice { amount currencyCode }
              maxVariantPrice { amount currencyCode }
            }
            onlineStoreUrl
          }
        }
      }
    }
  `;

  const response = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API request failed: ${response.status} ${response.statusText}`);
  }

  const { data, errors } = await response.json();

  if (errors || !data) {
    throw new Error(
      errors
        ? errors.map((e: any) => e.message).join(', ')
        : 'No data returned from Shopify'
    );
  }

  return data.products.edges.map((edge: ProductEdge) => edge.node);
}

/**
 * Fetch a single product by handle (for the hero ramp product).
 */
export async function fetchProductByHandle(handle: string): Promise<ProductEdge['node'] | null> {
  const query = `
    query ProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        description
        descriptionHtml
        availableForSale
        variants(first: 250) {
          edges {
            node {
              id
              title
              price { amount currencyCode }
              availableForSale
              quantityAvailable
              selectedOptions {
                name
                value
              }
            }
          }
        }
        featuredImage {
          url
          altText
        }
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }
        priceRange {
          minVariantPrice { amount currencyCode }
          maxVariantPrice { amount currencyCode }
        }
        onlineStoreUrl
      }
    }
  `;

  const response = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables: { handle } }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API request failed: ${response.status} ${response.statusText}`);
  }

  const { data, errors } = await response.json();

  if (errors || !data?.product) {
    return null;
  }

  return data.product;
}

export interface CartLine {
  merchandiseId: string;
  quantity: number;
  attributes?: { key: string; value: string }[];
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  discountCodes?: { code: string; applicable: boolean }[];
  cost: {
    totalAmount: { amount: string; currencyCode: string };
    subtotalAmount: { amount: string; currencyCode: string };
    totalTaxAmount?: { amount: string; currencyCode: string };
    totalDutyAmount?: { amount: string; currencyCode: string };
  };
  lines: {
    edges: {
      node: {
        id: string;
        quantity: number;
        cost: {
          totalAmount: { amount: string; currencyCode: string };
        };
        merchandise: {
          id: string;
          title: string;
          product: { title: string; handle: string };
          selectedOptions: { name: string; value: string }[];
        };
      };
    }[];
  };
}

/**
 * Create a new cart.
 */
export async function createCart(lines: CartLine[] = [], discountCodes: string[] = []): Promise<Cart> {
  const query = `
    mutation CartCreate($input: CartInput) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
          totalQuantity
          discountCodes { code applicable }
          cost {
            totalAmount { amount currencyCode }
            subtotalAmount { amount currencyCode }
            totalTaxAmount { amount currencyCode }
            totalDutyAmount { amount currencyCode }
          }
          lines(first: 250) {
            edges {
              node {
                id
                quantity
                cost { totalAmount { amount currencyCode } }
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    product { title handle }
                    selectedOptions { name value }
                  }
                }
              }
            }
          }
        }
        userErrors { field message }
      }
    }
  `;

  const response = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({
      query,
      variables: { input: { lines, discountCodes } },
    }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API request failed: ${response.status} ${response.statusText}`);
  }

  const { data, errors } = await response.json();

  if (errors || data?.cartCreate?.userErrors?.length) {
    const msg = data?.cartCreate?.userErrors?.[0]?.message || errors?.[0]?.message || 'Cart creation failed';
    throw new Error(msg);
  }

  return data.cartCreate.cart;
}

/**
 * Add lines to an existing cart.
 */
export async function addToCart(cartId: string, lines: CartLine[]): Promise<Cart> {
  const query = `
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            totalAmount { amount currencyCode }
            subtotalAmount { amount currencyCode }
            totalTaxAmount { amount currencyCode }
            totalDutyAmount { amount currencyCode }
          }
          lines(first: 250) {
            edges {
              node {
                id
                quantity
                cost { totalAmount { amount currencyCode } }
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    product { title handle }
                    selectedOptions { name value }
                  }
                }
              }
            }
          }
        }
        userErrors { field message }
      }
    }
  `;

  const response = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({
      query,
      variables: { cartId, lines },
    }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API request failed: ${response.status} ${response.statusText}`);
  }

  const { data, errors } = await response.json();

  if (errors || data?.cartLinesAdd?.userErrors?.length) {
    const msg = data?.cartLinesAdd?.userErrors?.[0]?.message || errors?.[0]?.message || 'Add to cart failed';
    throw new Error(msg);
  }

  return data.cartLinesAdd.cart;
}

/**
 * Get cart by ID.
 */
export async function getCart(cartId: string): Promise<Cart | null> {
  const query = `
    query GetCart($cartId: ID!) {
      cart(id: $cartId) {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount { amount currencyCode }
          subtotalAmount { amount currencyCode }
          totalTaxAmount { amount currencyCode }
          totalDutyAmount { amount currencyCode }
        }
        lines(first: 250) {
          edges {
            node {
              id
              quantity
              cost { totalAmount { amount currencyCode } }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product { title handle }
                  selectedOptions { name value }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables: { cartId } }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API request failed: ${response.status} ${response.statusText}`);
  }

  const { data, errors } = await response.json();

  if (errors || !data?.cart) {
    return null;
  }

  return data.cart;
}

/**
 * Update cart line quantities.
 */
export async function updateCartLines(cartId: string, lines: { id: string; quantity: number }[]): Promise<Cart> {
  const query = `
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            totalAmount { amount currencyCode }
            subtotalAmount { amount currencyCode }
          }
          lines(first: 250) {
            edges {
              node {
                id
                quantity
                cost { totalAmount { amount currencyCode } }
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    product { title handle }
                    selectedOptions { name value }
                  }
                }
              }
            }
          }
        }
        userErrors { field message }
      }
    }
  `;

  const response = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({
      query,
      variables: { cartId, lines },
    }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API request failed: ${response.status} ${response.statusText}`);
  }

  const { data, errors } = await response.json();

  if (errors || data?.cartLinesUpdate?.userErrors?.length) {
    const msg = data?.cartLinesUpdate?.userErrors?.[0]?.message || errors?.[0]?.message || 'Cart update failed';
    throw new Error(msg);
  }

  return data.cartLinesUpdate.cart;
}

/**
 * Remove lines from cart.
 */
export async function removeFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
  const query = `
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            totalAmount { amount currencyCode }
            subtotalAmount { amount currencyCode }
          }
          lines(first: 250) {
            edges {
              node {
                id
                quantity
                cost { totalAmount { amount currencyCode } }
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    product { title handle }
                    selectedOptions { name value }
                  }
                }
              }
            }
          }
        }
        userErrors { field message }
      }
    }
  `;

  const response = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({
      query,
      variables: { cartId, lineIds },
    }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API request failed: ${response.status} ${response.statusText}`);
  }

  const { data, errors } = await response.json();

  if (errors || data?.cartLinesRemove?.userErrors?.length) {
    const msg = data?.cartLinesRemove?.userErrors?.[0]?.message || errors?.[0]?.message || 'Cart remove failed';
    throw new Error(msg);
  }

  return data.cartLinesRemove.cart;
}

/**
 * Real, live stock level for a product, summed across purchasable variants.
 *
 * Used for compliant scarcity messaging: stock claims must reflect the actual
 * Shopify inventory, not a fabricated number. Returns null when inventory is
 * not tracked or the API call fails, so callers can hide the message entirely
 * rather than invent a figure.
 */
export async function fetchProductStock(handle: string): Promise<number | null> {
  const query = `
    query ProductStock($handle: String!) {
      product(handle: $handle) {
        variants(first: 250) {
          edges {
            node {
              id
              availableForSale
              quantityAvailable
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': TOKEN,
      },
      body: JSON.stringify({ query, variables: { handle } }),
    });

    if (!response.ok) return null;

    const { data, errors } = await response.json();
    if (errors || !data?.product) return null;

    const quantities: number[] = data.product.variants.edges
      .map((edge: { node: { availableForSale: boolean; quantityAvailable: number | null } }) =>
        edge.node.availableForSale ? edge.node.quantityAvailable : null
      )
      .filter((q: number | null): q is number => typeof q === 'number');

    // Untracked inventory yields no numbers — signal "unknown" with null
    if (quantities.length === 0) return null;

    return quantities.reduce((sum: number, q: number) => sum + q, 0);
  } catch {
    return null;
  }
}