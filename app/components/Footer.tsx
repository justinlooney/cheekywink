import {Link} from 'react-router';
import {useTextReveal} from '~/animation/useTextReveal';

/**
 * Oversized "outro" footer — a hallmark of award sites. The wordmark reveals on
 * scroll-in via the SplitText-free text reveal hook.
 */
export function Footer() {
  const heading = useTextReveal<HTMLHeadingElement>();
  return (
    <footer className="bg-ink px-6 py-20 text-cream md:px-10">
      <h2
        ref={heading}
        className="font-display text-fluid-xl leading-[0.9] text-blush"
      >
        Wink back.
      </h2>
      <div className="mt-16 grid grid-cols-2 gap-8 text-sm uppercase tracking-widest md:grid-cols-4">
        <div className="space-y-3">
          <p className="text-cream/40">Shop</p>
          <Link to="/collections/new-arrivals" className="block hover:text-rose">New Arrivals</Link>
          <Link to="/collections/dresses-and-skirts" className="block hover:text-rose">Dresses</Link>
          <Link to="/collections/handbags-and-totes" className="block hover:text-rose">Handbags</Link>
          <Link to="/collections/sale" className="block hover:text-rose">Sale</Link>
        </div>
        <div className="space-y-3">
          <p className="text-cream/40">Categories</p>
          <Link to="/collections/denim-collection" className="block hover:text-rose">Denim</Link>
          <Link to="/collections/accessories" className="block hover:text-rose">Jewelry</Link>
          <Link to="/collections/shoes" className="block hover:text-rose">Shoes</Link>
          <Link to="/collections/loungewear-and-pajamas" className="block hover:text-rose">Loungewear</Link>
        </div>
        <div className="space-y-3">
          <p className="text-cream/40">Help</p>
          {/* Shopify auto-creates /policies/* when you set store policies. */}
          <Link to="/policies/shipping-policy" className="block hover:text-rose">Shipping</Link>
          <Link to="/policies/refund-policy" className="block hover:text-rose">Returns</Link>
          <Link to="/policies/privacy-policy" className="block hover:text-rose">Privacy</Link>
        </div>
        <div className="space-y-3">
          <p className="text-cream/40">Social</p>
          <a href="https://instagram.com" className="block hover:text-rose">Instagram</a>
          <a href="https://tiktok.com" className="block hover:text-rose">TikTok</a>
        </div>
      </div>
      <p className="mt-16 text-xs text-cream/30">
        © {new Date().getFullYear()} The Cheeky Wink. All rights reserved.
      </p>
    </footer>
  );
}
