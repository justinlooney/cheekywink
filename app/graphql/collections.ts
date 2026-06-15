import {PRODUCT_CARD_FRAGMENT} from '~/graphql/fragments';

// Homepage hero collection — fetched by handle so YOU control what's featured.
// Change the handle in app/routes/_index.tsx (FEATURED_HANDLE).
export const FEATURED_COLLECTION_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query FeaturedCollection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      products(first: 12) {
        nodes {
          ...ProductCard
        }
      }
    }
  }
` as const;

export const COLLECTION_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query Collection(
    $handle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      description
      handle
      products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
        nodes {
          ...ProductCard
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          startCursor
          endCursor
        }
      }
    }
  }
` as const;
