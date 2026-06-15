// Storefront GraphQL fragments owned by the custom UI layer.
// NOTE: kept separate from the scaffold's app/lib/fragments.ts (which holds the
// menu + cart fragments) so we never clobber Hydrogen's generated cart typing.

export const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCard on Product {
    id
    title
    handle
    featuredImage { id url altText width height }
    priceRange { minVariantPrice { amount currencyCode } }
    compareAtPriceRange { minVariantPrice { amount currencyCode } }
  }
` as const;

export const MEDIA_FRAGMENT = `#graphql
  fragment Media on Media {
    __typename
    mediaContentType
    alt
    previewImage { url width height }
    ... on MediaImage { id image { url width height altText } }
    ... on Model3d { id sources { mimeType url } }
  }
` as const;

export const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    id
    title
    availableForSale
    selectedOptions { name value }
    image { id url altText width height }
    price { amount currencyCode }
    compareAtPrice { amount currencyCode }
  }
` as const;
