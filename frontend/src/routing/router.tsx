import { 
  createRootRoute, 
  createRoute, 
  createRouter, 
  Outlet, 
  //Link, 
  redirect
} from '@tanstack/react-router';
import { useAuthStore } from '../store/authStore';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { Suspense, useEffect } from 'react';
import {useNavigate} from '@tanstack/react-router';
import { Navbar } from '../components/navbar';
import { NfcPage } from '../pages/NfcPage';
import React from 'react';




const RootComponent = () => {
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  // Reagisce ai cambiamenti del token
  useEffect(() => {
    if (!token) {
      navigate({ to: '/login' });
    }
  }, [token, navigate]);


const TanStackRouterDevtools =
  import.meta.env.MODE === 'production'
    ? () => null
    : React.lazy(() =>
        import('@tanstack/router-devtools').then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      )

  return (
    <div className="min-h-screen bg-background">
      <Navbar /> {/* <--- La Navbar ora è qui */}
      <main className="pt-20 px-4 pb-8 max-w-2xl mx-auto">
        <Outlet />
      </main>
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </div>
  );
};


// 1. Root Route: Il guscio dell'app
const rootRoute = createRootRoute({
    component: RootComponent
});

// 2. Rotta Index (Home) - Protetta
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
  beforeLoad: ({ location }) => {
    // Protezione rotta: se non c'è il token, vai al login
    const token = useAuthStore.getState().token;
    if (!token) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }
  },
});

// 3. Rotta Login
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});


const nfcRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nfc',
  component: NfcPage
});

// 4. Creazione dell'albero delle rotte
const routeTree = rootRoute.addChildren([indexRoute, loginRoute, nfcRoute]);

export const router = createRouter({ routeTree });

// Registrazione per il type-safety globale
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}