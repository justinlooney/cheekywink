import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {useRef} from 'react';
import {gsap, registerGsap} from '~/animation/gsap';

/**
 * Add-to-cart with optimistic UI + a tactile press micro-interaction. Uses
 * Hydrogen's `CartForm` so the mutation runs through the server cart action
 * (no client-side Storefront token, correct optimistic cart). The fetcher
 * state drives the label so the button can't be double-submitted.
 */
export function AddToCartButton({
  lines,
  disabled,
  children,
}: {
  lines: OptimisticCartLineInput[];
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const btn = useRef<HTMLButtonElement>(null);

  const press = () => {
    registerGsap();
    if (!btn.current) return;
    gsap.fromTo(
      btn.current,
      {scale: 0.96},
      {scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)'},
    );
  };

  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher) => {
        const busy = fetcher.state !== 'idle';
        return (
          <button
            ref={btn}
            type="submit"
            onClick={press}
            disabled={disabled || busy}
            className="w-full rounded-full bg-wine px-8 py-4 text-sm font-medium uppercase tracking-widest text-cream transition-colors duration-300 ease-expo-out hover:bg-rose disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Adding…' : children}
          </button>
        );
      }}
    </CartForm>
  );
}
