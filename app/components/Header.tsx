import {Link, useRouteLoaderData, Await} from 'react-router';
import {Suspense, useEffect, useRef, useState} from 'react';
import {gsap} from '~/animation/gsap';
import {useGsapContext} from '~/animation/useGsapContext';
import {CartDrawer} from './CartDrawer';
import type {RootLoader} from '~/root';

/**
 * Navigation model. Top-level items either link directly (`to`) or open a
 * mega-panel of columns. Handles map to real Cheeky Wink collections — edit
 * here to restructure the whole nav (desktop panels + mobile menu share this).
 */
type NavLink = {label: string; to: string};
type NavItem =
  | {label: string; to: string}
  | {label: string; columns: {heading: string; links: NavLink[]}[]};

const MENU: NavItem[] = [
  {label: 'Shop All', to: '/collections/all'},
  {
    label: 'Clothing',
    columns: [
      {
        heading: 'Featured',
        links: [
          {label: 'New Arrivals', to: '/collections/new-arrivals'},
          {label: 'Best Sellers', to: '/collections/best-sellers'},
          {label: 'Sale', to: '/collections/sale'},
        ],
      },
      {
        heading: 'Tops & Dresses',
        links: [
          {label: 'Dresses & Skirts', to: '/collections/dresses-and-skirts'},
          {label: 'Tops & Blouses', to: '/collections/casual-tees-and-blouses'},
          {label: 'Sweaters & Hoodies', to: '/collections/womens-sweaters-and-hoodies'},
        ],
      },
      {
        heading: 'Bottoms & More',
        links: [
          {label: 'Denim', to: '/collections/denim-collection'},
          {label: 'Bottoms & Rompers', to: '/collections/bottoms-and-rompers'},
          {label: 'Loungewear', to: '/collections/loungewear-and-pajamas'},
          {label: 'Swimwear', to: '/collections/womens-swimwear'},
        ],
      },
    ],
  },
  {
    label: 'Accessories',
    columns: [
      {
        heading: 'Bags & Shoes',
        links: [
          {label: 'Handbags & Totes', to: '/collections/handbags-and-totes'},
          {label: 'Shoes', to: '/collections/shoes'},
        ],
      },
      {
        heading: 'Jewelry',
        links: [
          {label: 'Necklaces', to: '/collections/necklaces'},
          {label: 'Bracelets', to: '/collections/bracelets'},
          {label: 'Earrings', to: '/collections/earrings'},
          {label: 'Rings', to: '/collections/rings'},
        ],
      },
      {
        heading: 'Extras',
        links: [
          {label: 'Sunglasses', to: '/collections/sunglasses'},
          {label: 'Hats', to: '/collections/hats'},
          {label: 'Scarves', to: '/collections/scarves'},
          {label: 'Belts', to: '/collections/belts'},
        ],
      },
    ],
  },
  {
    label: 'Occasion',
    columns: [
      {
        heading: 'Shop the moment',
        links: [
          {label: 'Wedding Guest', to: '/collections/wedding-guest-collection'},
          {label: 'Vacation Ready', to: '/collections/vacation-ready-collection'},
          {label: 'Formal Dresses', to: '/collections/formal-dresses'},
          {label: 'Concert Ready', to: '/collections/concert-ready-collection'},
        ],
      },
    ],
  },
  {label: 'Sale', to: '/collections/sale'},
];

function hasColumns(
  item: NavItem,
): item is {label: string; columns: {heading: string; links: NavLink[]}[]} {
  return 'columns' in item;
}

export function Header() {
  const data = useRouteLoaderData<RootLoader>('root');
  const [cartOpen, setCartOpen] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const scope = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Keep the smart-hide from triggering while a menu is open.
  const menuOpenRef = useRef(false);
  menuOpenRef.current = openIdx !== null || mobileOpen;

  // Smart hide on scroll-down / reveal on scroll-up.
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
          const hide = dir === 1 && y > 120 && !menuOpenRef.current;
          gsap.to(nav, {
            yPercent: hide ? -100 : 0,
            duration: 0.4,
            ease: 'expo.out',
            overwrite: true,
          });
        },
      },
    });
  });

  // Fade the mega-panel in when the open item changes.
  useEffect(() => {
    if (openIdx !== null && panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        {autoAlpha: 0, y: -8},
        {autoAlpha: 1, y: 0, duration: 0.3, ease: 'expo.out'},
      );
    }
  }, [openIdx]);

  const activeColumns =
    openIdx !== null && hasColumns(MENU[openIdx]!)
      ? (MENU[openIdx] as {columns: {heading: string; links: NavLink[]}[]}).columns
      : null;

  return (
    <>
      <header
        ref={scope}
        className={`fixed inset-x-0 top-0 z-40 ${
          openIdx !== null ? 'bg-ink shadow-2xl' : ''
        }`}
        onMouseLeave={() => setOpenIdx(null)}
      >
        {/* Top bar: blend over the hero, but go solid when a menu is open. */}
        <div
          className={`flex items-center justify-between px-6 py-5 md:px-10 ${
            openIdx !== null ? '' : 'mix-blend-difference'
          }`}
        >
          <Link to="/" className="font-display text-2xl tracking-tight text-cream">
            The Cheeky Wink
          </Link>

          <nav className="hidden gap-8 text-sm uppercase tracking-widest text-cream md:flex">
            {MENU.map((item, i) =>
              hasColumns(item) ? (
                <button
                  key={item.label}
                  type="button"
                  aria-expanded={openIdx === i}
                  className="uppercase tracking-widest transition-opacity hover:opacity-70"
                  onMouseEnter={() => setOpenIdx(i)}
                  onFocus={() => setOpenIdx(i)}
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  prefetch="intent"
                  onMouseEnter={() => setOpenIdx(null)}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-5">
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
            {/* Mobile hamburger */}
            <button
              className="text-cream md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Desktop mega-panel */}
        {activeColumns ? (
          <div
            ref={panelRef}
            className="hidden border-t border-cream/10 bg-ink shadow-2xl md:block"
          >
            <div className="grid grid-cols-4 gap-10 px-10 py-10">
              {activeColumns.map((col) => (
                <div key={col.heading} className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                    {col.heading}
                  </p>
                  <ul className="space-y-3">
                    {col.links.map((l) => (
                      <li key={l.to}>
                        <Link
                          to={l.to}
                          prefetch="intent"
                          className="text-[15px] text-cream transition-colors hover:text-rose"
                          onClick={() => setOpenIdx(null)}
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      {/* Mobile full-screen menu */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink px-6 py-6 md:hidden">
          <div className="mb-8 flex items-center justify-between">
            <Link
              to="/"
              className="font-display text-2xl text-cream"
              onClick={() => setMobileOpen(false)}
            >
              The Cheeky Wink
            </Link>
            <button
              aria-label="Close menu"
              className="text-2xl text-cream"
              onClick={() => setMobileOpen(false)}
            >
              ✕
            </button>
          </div>
          <nav className="space-y-8">
            {MENU.map((item) =>
              hasColumns(item) ? (
                <div key={item.label} className="space-y-4">
                  <p className="font-display text-2xl text-blush">{item.label}</p>
                  {item.columns.map((col) => (
                    <div key={col.heading} className="space-y-2 pl-1">
                      <p className="text-xs uppercase tracking-[0.25em] text-gold/70">
                        {col.heading}
                      </p>
                      {col.links.map((l) => (
                        <Link
                          key={l.to}
                          to={l.to}
                          className="block text-cream/80"
                          onClick={() => setMobileOpen(false)}
                        >
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  className="block font-display text-2xl text-blush"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
        </div>
      ) : null}

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
