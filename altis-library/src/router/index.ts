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

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(( { store }) => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
  });


  let sessionRestored = false

  Router.beforeEach((to) => {
    const authStore = useAuthStore(store)

    if (!sessionRestored && !import.meta.env.SSR) {
      authStore.restoreSession()
      sessionRestored = true
    }

    if (to.path === '/login' && authStore.isAuthenticated()) {
      return '/dashboard'
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated()) {
      return '/login'
    }

    const allowedRoles = to.meta.roles as UserRole[] | undefined

    if (allowedRoles) {
      if (!authStore.user) {
        return '/login'
      }

      if (!allowedRoles.includes(authStore.user.role)) {
        return '/acess-denied'
      }
    }

    return true
  })

  return Router;
});
