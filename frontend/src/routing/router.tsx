import { 
  createRootRoute, 
  createRoute, 
  createRouter, 
  Outlet, 
  Link, 
  redirect
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { useAuthStore } from '../store/authStore';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';

// 1. Root Route: Il guscio dell'app
const rootRoute = createRootRoute({
  component: () => (
    <>
      <div className="min-h-screen bg-background p-4">
        <Outlet /> 
      </div>
      {/* Devtools utili in fase di sviluppo */}
      <TanStackRouterDevtools />
    </>
  ),
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

// 4. Creazione dell'albero delle rotte
const routeTree = rootRoute.addChildren([indexRoute, loginRoute]);

export const router = createRouter({ routeTree });

// Registrazione per il type-safety globale
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}