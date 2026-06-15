import {Link} from 'react-router';
import {CartForm, Image, Money, type OptimisticCart} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useRef} from 'react';
import {gsap, registerGsap} from '~/animation/gsap';
import {useGsapContext} from '~/animation/useGsapContext';

type Cart = OptimisticCart<CartApiQueryFragment | null>;

/**
 * Slide-over cart. The panel slides + the backdrop fades via a single GSAP
 * timeline played/reversed on the `open` prop. Lines animate in with a stagger.
 * Empty state nudges back to shopping (conversion: never a dead end).
 */
export function CartDrawer({
  cart,
  open,
  onClose,
}: {
  cart: Cart;
  open: boolean;
  onClose: () => void;
}) {
  const scope = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useGsapContext(
    scope,
    () => {
      registerGsap();
      tl.current = gsap
        .timeline({paused: true})
        .to('.cart-backdrop', {autoAlpha: 1, duration: 0.4})
        .fromTo(
          '.cart-panel',
          {xPercent: 100},
          {xPercent: 0, duration: 0.6, ease: 'expo.out'},
          '<',
        )
        .from(
          '.cart-line',
          {x: 30, autoAlpha: 0, stagger: 0.06, duration: 0.4},
          '-=0.25',
        );
    },
    [],
  );

  // Drive the timeline whenever `open` changes.
  if (typeof window !== 'undefined' && tl.current) {
    open ? tl.current.play() : tl.current.reverse();
  }

  const lines = cart?.lines?.nodes ?? [];

  return (
    <div
      ref={scope}
      className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        className="cart-backdrop invisible absolute inset-0 bg-ink/50 opacity-0 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close cart"
      />
      <aside className="cart-panel absolute right-0 top-0 flex h-full w-full max-w-md translate-x-full flex-col bg-cream shadow-2xl">
        <header className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <h2 className="font-display text-2xl text-ink">Your Bag</h2>
          <button onClick={onClose} className="text-ink/60 hover:text-ink" aria-label="Close">
            ✕
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-ink/60">Your bag is feeling shy.</p>
            <Link to="/collections/all" onClick={onClose} className="text-wine underline">
              Discover the collection
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              {lines.map((line) => (
                <li key={line.id} className="cart-line flex gap-4">
                  {line.merchandise.image && (
                    <Image
                      data={line.merchandise.image}
                      className="h-24 w-20 rounded-lg object-cover"
                      sizes="80px"
                    />
                  )}
                  <div className="flex flex-1 flex-col">
                    <span className="font-medium text-ink">
                      {line.merchandise.product.title}
                    </span>
                    <span className="text-sm text-ink/50">{line.merchandise.title}</span>
                    <div className="mt-auto flex items-center justify-between">
                      <Money data={line.cost.totalAmount} className="text-wine" />
                      <CartForm
                        route="/cart"
                        inputs={{lineIds: [line.id]}}
                        action={CartForm.ACTIONS.LinesRemove}
                      >
                        <button className="text-xs uppercase tracking-wide text-ink/40 hover:text-wine">
                          Remove
                        </button>
                      </CartForm>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-ink/10 px-6 py-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-ink/60">Subtotal</span>
                {cart?.cost?.subtotalAmount && (
                  <Money
                    data={cart.cost.subtotalAmount}
                    className="font-display text-xl text-ink"
                  />
                )}
              </div>
              <a
                href={cart?.checkoutUrl ?? '#'}
                className="block w-full rounded-full bg-wine py-4 text-center text-sm font-medium uppercase tracking-widest text-cream transition-colors hover:bg-rose"
              >
                Checkout
              </a>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
