import { defineBoot } from '#q-app';
import { useAuthStore } from '@/stores/authStore';
import { markSessionErrorHandled } from '@/utils/apiErrors';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.QCLI_API_URL,
});

let sessionRedirectInProgress = false;

export default defineBoot(({ store, router }) => {
  const authStore = useAuthStore(store);

  api.interceptors.request.use((config) => {
    if (authStore.token) {
      config.headers.set('Authorization', `Bearer ${authStore.token}`);
    }

    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!axios.isAxiosError(error)) throw error;

      const status = error.response?.status;
      const requestPath = error.config?.url?.split('?')[0] ?? '';
      const isPublicAuthRequest = [
        '/auth/login',
        '/auth/forgot-password',
        '/auth/reset-password',
      ].includes(requestPath);

      const currentRoute = router.currentRoute.value;
      const routeRequiresAuth = currentRoute.matched.some((record) => record.meta.requiresAuth);

      if (
        status === 401 &&
        !isPublicAuthRequest &&
        !sessionRedirectInProgress &&
        (authStore.token || routeRequiresAuth)
      ) {
        markSessionErrorHandled(error);
        authStore.expireSession();
        if (currentRoute.path !== '/login') {
          sessionRedirectInProgress = true;
          try {
            await router.replace('/login');
          } finally {
            sessionRedirectInProgress = false;
          }
        }
      } else if (status === 403 && routeRequiresAuth && currentRoute.path !== '/acess-denied') {
        await router.replace('/acess-denied');
      }

      throw error;
    },
  );
});
export { api };
