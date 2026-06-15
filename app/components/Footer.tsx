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
          <Link to="/collections/all" className="block hover:text-rose">All</Link>
          <Link to="/collections/new" className="block hover:text-rose">New In</Link>
        </div>
        <div className="space-y-3">
          <p className="text-cream/40">Help</p>
          <Link to="/pages/shipping" className="block hover:text-rose">Shipping</Link>
          <Link to="/pages/returns" className="block hover:text-rose">Returns</Link>
        </div>
        <div className="space-y-3">
          <p className="text-cream/40">Company</p>
          <Link to="/pages/about" className="block hover:text-rose">About</Link>
          <Link to="/pages/contact" className="block hover:text-rose">Contact</Link>
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
