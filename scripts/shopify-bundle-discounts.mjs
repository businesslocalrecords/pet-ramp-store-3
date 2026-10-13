import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootDirectory = path.resolve(scriptDirectory, '..');
const config = JSON.parse(
  fs.readFileSync(path.join(rootDirectory, 'src/lib/bundle-discounts.json'), 'utf8')
);
const apply = process.argv.includes('--apply');
const dryRun = process.argv.includes('--dry-run') || !apply;

if (apply && process.argv.includes('--dry-run')) {
  throw new Error('Choose either --apply or --dry-run, not both.');
}

function loadEnv() {
  const values = { ...process.env };
  const envPath = path.join(rootDirectory, '.env.local');
  if (!fs.existsSync(envPath)) return values;

  for (const rawLine of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    values[key] ??= value;
  }
  return values;
}

const env = loadEnv();
const shopDomain = env.VITE_SHOPIFY_STOREFRONT_DOMAIN;
const apiVersion = '2025-10';

const catalogKeyToDiscountHandles = {
  heroRamp: config.productHandles.heroRamp,
  tractionMat: config.productHandles.tractionMat,
  carTether: config.productHandles.carTether,
};

console.log(`Shopify bundle discounts for ${shopDomain || '(store from .env.local)'}`);
for (const [tier, discount] of Object.entries(config.discounts)) {
  const handles = discount.productKeys.map((key) => catalogKeyToDiscountHandles[key]);
  console.log(
    `  ${tier}: ${discount.code} takes $${discount.amount} off ${handles.join(', ')} ` +
      `with a $${discount.minimumSubtotal} minimum subtotal.`
  );
}

if (dryRun) {
  console.log('Dry run only. No Shopify credentials or API calls were used.');
  console.log('Apply requires write_discounts. read_discounts enables inspection and updates of existing codes.');
  process.exit(0);
}

if (!shopDomain) {
  throw new Error('VITE_SHOPIFY_STOREFRONT_DOMAIN is required in .env.local.');
}

let adminToken = env.SHOPIFY_ADMIN_ACCESS_TOKEN || null;
let grantedScopes = [];
if (env.SHOPIFY_CLIENT_ID && env.SHOPIFY_CLIENT_SECRET) {
  const response = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: env.SHOPIFY_CLIENT_ID,
      client_secret: env.SHOPIFY_CLIENT_SECRET,
    }),
  });
  if (!response.ok) {
    throw new Error(`Shopify Admin token exchange failed with HTTP ${response.status}.`);
  }
  const tokenResponse = await response.json();
  adminToken = tokenResponse.access_token;
  grantedScopes = tokenResponse.scope?.split(',').map((scope) => scope.trim()) ?? [];
} else if (!adminToken) {
  throw new Error('Admin credentials are required in .env.local to apply discounts.');
}

const requiredScopes = ['write_products', 'write_discounts'];
const missingScopes = requiredScopes.filter(
  (scope) => grantedScopes.length > 0 && !grantedScopes.includes(scope)
);
if (missingScopes.length) {
  throw new Error(
    `The Shopify app is missing ${missingScopes.join(', ')}. Add these scopes in Shopify, ` +
      'release a new app version, then rerun this command.'
  );
}
if (grantedScopes.length > 0 && !grantedScopes.includes('read_discounts')) {
  console.warn(
    'read_discounts is not granted; existing codes will not be inspected. Shopify will reject duplicates without overwriting them.'
  );
}

async function adminGraphql(query, variables = {}) {
  const response = await fetch(`https://${shopDomain}/admin/api/${apiVersion}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  const payload = await response.json();
  if (!response.ok || payload.errors?.length) {
    throw new Error(
      `Shopify Admin API request failed: ${payload.errors?.map((error) => error.message).join('; ') || response.statusText}`
    );
  }
  return payload.data;
}

async function findProductId(handle) {
  const data = await adminGraphql(
    `query ProductByHandle($query: String!) {
       products(first: 2, query: $query) {
         edges { node { id handle } }
       }
     }`,
    { query: `handle:${handle}` }
  );
  const products = data.products.edges.map((edge) => edge.node);
  const product = products.find((candidate) => candidate.handle === handle);
  if (!product) throw new Error(`Shopify product is missing: ${handle}`);
  return product.id;
}

async function makeDiscountInput(tier, discount) {
  const productIds = await Promise.all(
    discount.productKeys.map((key) => findProductId(catalogKeyToDiscountHandles[key]))
  );
  return {
    title: `PawGrip Pro tier ${tier} bundle`,
    code: discount.code,
    startsAt: new Date().toISOString(),
    context: { all: 'ALL' },
    customerGets: {
      value: {
        discountAmount: { amount: discount.amount, appliesOnEachItem: false },
      },
      items: { products: { productsToAdd: productIds } },
    },
    minimumRequirement: {
      subtotal: { greaterThanOrEqualToSubtotal: discount.minimumSubtotal },
    },
    appliesOncePerCustomer: false,
    combinesWith: {
      orderDiscounts: false,
      productDiscounts: false,
      shippingDiscounts: false,
    },
  };
}

for (const [tier, discount] of Object.entries(config.discounts)) {
  if (grantedScopes.includes('read_discounts')) {
    const existing = await adminGraphql(
      `query DiscountByCode($code: String!) {
         codeDiscountNodeByCode(code: $code) {
           id
           codeDiscount {
             __typename
             ... on DiscountCodeBasic { title status }
           }
         }
       }`,
      { code: discount.code }
    );
    const existingNode = existing.codeDiscountNodeByCode;
    if (existingNode) {
      const basicDiscount = existingNode.codeDiscount;
      if (
        basicDiscount.__typename !== 'DiscountCodeBasic' ||
        basicDiscount.title !== `PawGrip Pro tier ${tier} bundle`
      ) {
        throw new Error(
          `Discount code ${discount.code} already belongs to a different discount. ` +
            'Review it in Shopify Admin; this script will not overwrite it.'
        );
      }
        const update = await adminGraphql(
          `mutation UpdateBundleDiscount($id: ID!, $discount: DiscountCodeBasicInput!) {
             discountCodeBasicUpdate(id: $id, basicCodeDiscount: $discount) {
               codeDiscountNode { id }
               userErrors { field message }
             }
           }`,
          {
            id: existingNode.id,
            discount: await makeDiscountInput(tier, discount),
          }
        );
        const updateResult = update.discountCodeBasicUpdate;
        if (updateResult.userErrors?.length) {
          throw new Error(
            `${discount.code}: ${updateResult.userErrors.map((error) => error.message).join('; ')}`
          );
      }
        console.log(`  Updated ${discount.code} (${updateResult.codeDiscountNode.id}).`);
      continue;
    }
  }

  const data = await adminGraphql(
    `mutation CreateBundleDiscount($discount: DiscountCodeBasicInput!) {
       discountCodeBasicCreate(basicCodeDiscount: $discount) {
         codeDiscountNode {
           id
           codeDiscount {
             __typename
             ... on DiscountCodeBasic { title status }
           }
         }
         userErrors { field message }
       }
     }`,
    { discount: await makeDiscountInput(tier, discount) }
  );

  const result = data.discountCodeBasicCreate;
  if (result.userErrors?.length) {
    const messages = result.userErrors.map((error) => error.message).join('; ');
    if (/discount code.*(taken|already)|code.*already/i.test(messages)) {
      console.warn(
        `  ${discount.code} already exists; it was not overwritten. Verify its configuration in Shopify Admin and confirm its cart total.`
      );
      continue;
    }
    throw new Error(
      `${discount.code}: ${messages}`
    );
  }
  if (!result.codeDiscountNode) {
    throw new Error(`Shopify did not return the new discount node for ${discount.code}.`);
  }
  console.log(`  Created ${discount.code} (${result.codeDiscountNode.id}).`);
}