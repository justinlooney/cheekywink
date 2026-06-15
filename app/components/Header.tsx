import {Link, useRouteLoaderData} from 'react-router';
import {Suspense, useRef, useState} from 'react';
import {Await} from 'react-router';
import {gsap} from '~/animation/gsap';
import {useGsapContext} from '~/animation/useGsapContext';
import {CartDrawer} from './CartDrawer';
import type {RootLoader} from '~/root';

/**
 * Sticky header that hides on scroll-down, reveals on scroll-up (the classic
 * "smart nav"), implemented with a single ScrollTrigger using onUpdate
 * direction. Cart count streams in via Await (deferred root loader data).
 */
export function Header() {
  const data = useRouteLoaderData<RootLoader>('root');
  const [cartOpen, setCartOpen] = useState(false);
  const scope = useRef<HTMLElement>(null);

  useGsapContext(scope, () => {
    const nav = scope.current!;
    let last = 0;
    gsap.to(nav, {
      scrollTrigger: {
        start: 'top top',
        end: 'max',
        onUpdate: (self) => {
          const y = self.scroll();
          const dir = y > last ? 1 : -1;
          last = y;
          gsap.to(nav, {
            yPercent: dir === 1 && y > 120 ? -100 : 0,
            duration: 0.4,
            ease: 'expo.out',
            overwrite: true,
          });
        },
      },
    });
  });

  return (
    <>
      <header
        ref={scope}
        className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 mix-blend-difference md:px-10"
      >
        <Link to="/" className="font-display text-2xl tracking-tight text-cream">
          The Cheeky Wink
        </Link>
        <nav className="hidden gap-8 text-sm uppercase tracking-widest text-cream md:flex">
          <Link to="/collections/all" prefetch="intent">Shop</Link>
          <Link to="/collections/new" prefetch="intent">New</Link>
          <Link to="/pages/about" prefetch="intent">About</Link>
        </nav>
        <button
          onClick={() => setCartOpen(true)}
          className="text-sm uppercase tracking-widest text-cream"
        >
          Bag (
          <Suspense fallback={<span>0</span>}>
            <Await resolve={data?.cart}>
              {(cart) => <span>{cart?.totalQuantity ?? 0}</span>}
            </Await>
          </Suspense>
          )
        </button>
      </header>

      <Suspense fallback={null}>
        <Await resolve={data?.cart}>
          {(cart) => (
            <CartDrawer
              cart={cart as never}
              open={cartOpen}
              onClose={() => setCartOpen(false)}
            />
          )}
        </Await>
      </Suspense>
    </>
  );
}
