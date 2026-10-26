
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
      config.headers.set(
        'Authorization',
        `Bearer ${authStore.token}`,
      );
    }

    return config;
  });

  api.interceptors.response.use(
    (response) => response,

    async (error: unknown) => {
      if (!axios.isAxiosError(error)) {
        throw error instanceof Error
          ? error
          : new Error(String(error));
      }

      const status = error.response?.status;
      const requestPath = error.config?.url?.split('?')[0] ?? '';
      const requestMethod = error.config?.method?.toLowerCase();

      const currentRoute = router.currentRoute.value;
      const currentPath = currentRoute.path;

      const routeRequiresAuth = currentRoute.matched.some(
        (record) => record.meta.requiresAuth,
      );

      const publicAuthRoutes = [
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
      ];

      const publicAuthRequests = [
        '/auth/login',
        '/auth/forgot-password',
        '/auth/reset-password',
      ];

      const isPublicAuthRequest = publicAuthRequests.includes(
        requestPath,
      );

      if (
        isPublicAuthRequest ||
        publicAuthRoutes.includes(currentPath)
      ) {
        throw error;
      }

      const requestedUserId = requestPath.match(
        /(?:^|\/)users\/([^/]+)$/,
      )?.[1];

      const isOwnProfileRequest =
        (requestMethod === 'get' || requestMethod === 'patch') &&
        requestedUserId !== undefined &&
        requestedUserId === authStore.user?.id;

      if (status === 401) {
        if (
          isOwnProfileRequest &&
          !authStore.isSessionTokenExpired()
        ) {
          throw error;
        }

        if (
          !sessionRedirectInProgress &&
          (authStore.token || routeRequiresAuth)
        ) {
          markSessionErrorHandled(error);

          sessionRedirectInProgress = true;

          try {
            authStore.logout();

            if (currentPath !== '/login') {
              await router.replace('/login');
            }
          } finally {
            sessionRedirectInProgress = false;
          }
        }
      }

      if (
        status === 403 &&
        routeRequiresAuth &&
        currentPath !== '/acess-denied'
      ) {
        await router.replace('/acess-denied');
      }

      throw error;
    },
  );
});

export { api };
