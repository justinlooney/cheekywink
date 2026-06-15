import {
  MEDIA_FRAGMENT,
  PRODUCT_VARIANT_FRAGMENT,
} from '~/graphql/fragments';

// Full PDP query. `selectedOrFirstAvailableVariant` resolves the variant from
// URL search params server-side so the PDP is deep-linkable and SEO-correct.
export const PRODUCT_QUERY = `#graphql
  ${MEDIA_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}
  query Product(
    $handle: String!
    $selectedOptions: [SelectedOptionInput!]!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      vendor
      handle
      descriptionHtml
      description
      options {
        name
        optionValues {
          name
        }
      }
      media(first: 12) {
        nodes {
          ...Media
        }
      }
      selectedOrFirstAvailableVariant(
        selectedOptions: $selectedOptions
        ignoreUnknownOptions: true
        caseInsensitiveMatch: true
      ) {
        ...ProductVariant
      }
      adjacentVariants(selectedOptions: $selectedOptions) {
        ...ProductVariant
      }
      seo {
        description
        title
      }
    }
  }
` as const;
