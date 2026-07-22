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

// One request that pulls every collection the homepage merchandises, via
// aliases. Missing/renamed handles simply return null (guarded in the route),
// so the page degrades gracefully — never errors on a wrong slug.
export const HOME_COLLECTIONS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  fragment CollectionPreview on Collection {
    id
    title
    handle
    image { url altText width height }
    products(first: 10) { nodes { ...ProductCard } }
  }
  query HomeCollections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    newArrivals: collection(handle: "new-arrivals") { ...CollectionPreview }
    bestSellers: collection(handle: "best-sellers") { ...CollectionPreview }
    dresses: collection(handle: "dresses-and-skirts") { ...CollectionPreview }
    handbags: collection(handle: "handbags-and-totes") { ...CollectionPreview }
    denim: collection(handle: "denim-collection") { ...CollectionPreview }
    shoes: collection(handle: "shoes") { ...CollectionPreview }
    swimwear: collection(handle: "womens-swimwear") { ...CollectionPreview }
    accessories: collection(handle: "accessories") { ...CollectionPreview }
    tees: collection(handle: "casual-tees-and-blouses") { ...CollectionPreview }
    sale: collection(handle: "sale") { ...CollectionPreview }
  }
` as const;

// "Shop the Moment" cinematic scene — a handful of occasion collections,
// fetched by handle via aliases. A missing handle just returns null; the
// route filters it out, so the scene degrades to fewer panels, never errors.
export const MOMENTS_FIELDS_FRAGMENT = `#graphql
  fragment MomentFields on Collection {
    id
    title
    handle
    description
    image { url altText width height }
    products(first: 1) { nodes { featuredImage { url altText width height } } }
  }
` as const;

export const MOMENTS_QUERY = `#graphql
  ${MOMENTS_FIELDS_FRAGMENT}
  query ShopTheMoment($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    weddingGuest: collection(handle: "wedding-guest-collection") { ...MomentFields }
    vacationReady: collection(handle: "vacation-ready-collection") { ...MomentFields }
    concertReady: collection(handle: "concert-ready-collection") { ...MomentFields }
    formalDresses: collection(handle: "formal-dresses") { ...MomentFields }
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
