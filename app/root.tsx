import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import type {Route} from './+types/root';
import favicon from '~/assets/favicon.svg';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import tailwindCss from './styles/tailwind.css?url';

import {SmoothScrollProvider} from '~/animation/SmoothScrollProvider';
import {ProductTransitionProvider} from '~/animation/ProductTransition';
import {Header} from '~/components/Header';
import {Footer} from '~/components/Footer';
import {ScrollProgress} from '~/components/ScrollProgress';

export type RootLoader = typeof loader;

export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  if (formMethod && formMethod !== 'GET') return true;
  if (currentUrl.toString() === nextUrl.toString()) return true;
  return false;
};

export function links() {
  return [
    {rel: 'preconnect', href: 'https://cdn.shopify.com'},
    {rel: 'preconnect', href: 'https://shop.app'},
    {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
    {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous'},
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500&display=swap',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
}

export async function loader(args: Route.LoaderArgs) {
  const {storefront, env, cart} = args.context;
  return {
    cart: cart.get(),
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="stylesheet" href={tailwindCss} />
        <link rel="stylesheet" href={resetStyles} />
        <link rel="stylesheet" href={appStyles} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');
  if (!data) return <Outlet />;

  return (
    <Analytics.Provider cart={data.cart} shop={data.shop} consent={data.consent}>
      <ProductTransitionProvider>
        <SmoothScrollProvider>
          <ScrollProgress />
          <Header />
          <main>
            <Outlet />
          </main>
          <Footer />
        </SmoothScrollProvider>
      </ProductTransitionProvider>
    </Analytics.Provider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  // TEMPORARY debugging aid: show the real error on-screen so it's visible
  // on a phone with no cable/devtools access. `import.meta.env.DEV` is
  // build-time-stripped, so this never ships to a production build.
  let detail: string | null = null;
  if (import.meta.env.DEV && !is404) {
    if (error instanceof Error) {
      detail = `${error.message}\n\n${error.stack ?? ''}`;
    } else if (isRouteErrorResponse(error)) {
      detail = `${error.status} ${error.statusText}\n\n${JSON.stringify(error.data)}`;
    } else {
      detail = JSON.stringify(error, null, 2);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-display text-fluid-lg text-blush">
        {is404 ? 'Lost the wink.' : 'Something slipped.'}
      </h1>
      <a href="/" className="text-rose underline">
        Back to safety
      </a>
      {detail ? (
        <pre className="mt-8 max-w-2xl overflow-auto rounded-lg bg-black/60 p-4 text-left text-xs text-lime-300">
          {detail}
        </pre>
      ) : null}
    </div>
  );
}
