
import { defineRouter } from '#q-app';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

import routes from './routes';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types/auth';

export default defineRouter(({ store }) => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
  });

  let sessionRestored = false;

  Router.beforeEach((to) => {
    const authStore = useAuthStore(store);

    if (!sessionRestored) {
      if (!import.meta.env.SSR) {
        authStore.restoreSession();
      }

      sessionRestored = true;
    }

    const allowedRoles = to.meta.roles as UserRole[] | undefined;
    const requiresAuth = to.meta.requiresAuth || allowedRoles !== undefined;

    if (requiresAuth && !authStore.isAuthenticated()) {
      return '/login';
    }

    if (requiresAuth && authStore.isSessionTokenExpired()) {
      authStore.expireSession();
      return '/login';
    }

    if (to.path === '/login' && authStore.isAuthenticated()) {
      if (authStore.isSessionTokenExpired()) {
        authStore.expireSession();
        return true;
      }

      return '/dashboard';
    }

    if (allowedRoles) {
      if (!authStore.user) {
        return '/login';
      }

      if (!allowedRoles.includes(authStore.user.role)) {
        return '/acess-denied';
      }
    }

    return true;
  });

  return Router;
});
