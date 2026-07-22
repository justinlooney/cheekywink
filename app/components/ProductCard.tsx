import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {ProductCardFragment} from 'storefrontapi.generated';

/**
 * Grid card with a CSS-driven image zoom + price crossfade on hover. Title and
 * price are STACKED (not side-by-side) — long product titles are common in
 * this catalog and a side-by-side row squeezes the price into almost no
 * space on narrow mobile columns once the title wraps to 3-4 lines.
 */
export function ProductCard({
  product,
  loading = 'lazy',
}: {
  product: ProductCardFragment;
  loading?: 'eager' | 'lazy';
}) {
  const price = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange?.minVariantPrice;
  const onSale =
    compareAt && Number(compareAt.amount) > Number(price.amount);

  return (
    <Link
      to={`/products/${product.handle}`}
      prefetch="intent"
      className="group relative block overflow-hidden rounded-xl bg-cream"
    >
      <div className="aspect-[4/5] overflow-hidden">
        {product.featuredImage && (
          <Image
            data={product.featuredImage}
            aspectRatio="4/5"
            sizes="(min-width: 1024px) 25vw, 50vw"
            loading={loading}
            className="h-full w-full object-cover transition-transform duration-700 ease-expo-out group-hover:scale-105"
          />
        )}
        {onSale && (
          <span className="absolute left-3 top-3 rounded-full bg-wine px-3 py-1 text-xs font-medium uppercase tracking-wide text-cream">
            Sale
          </span>
        )}
      </div>
      <div className="px-1 py-3">
        <h3 className="line-clamp-2 font-display text-base leading-tight text-ink md:text-lg">
          {product.title}
        </h3>
        <div className="mt-1.5 flex items-baseline gap-2 text-sm">
          <Money data={price} className="font-medium text-wine" />
          {onSale && (
            <Money data={compareAt!} className="text-ink/40 line-through" />
          )}
        </div>
      </div>
    </Link>
  );
}
