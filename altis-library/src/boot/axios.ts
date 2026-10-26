import { defineBoot } from '#q-app';
import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.QCLI_API_URL,
});

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
      if (!axios.isAxiosError(error)) {
        throw error instanceof Error ? error : new Error(String(error));
      }

      const status = error.response?.status;
      const requestPath = error.config?.url?.split('?')[0] ?? '';
      const currentPath = router.currentRoute.value.path;
      const requestMethod = error.config?.method?.toLowerCase();
      const requestedUserId = requestPath.match(/(?:^|\/)users\/([^/]+)$/)?.[1];
      const isOwnProfileRequest =
        (requestMethod === 'get' || requestMethod === 'patch') &&
        requestedUserId !== undefined &&
        requestedUserId === authStore.user?.id;

      const publicAuthRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

      const isAuthRequest = ['/auth/login', '/auth/forgot-password', '/auth/reset-password'].some(
        (path) => requestPath.includes(path),
      );

      if (isAuthRequest || publicAuthRoutes.includes(currentPath)) {
        return Promise.reject(error);
      }

      if (status === 401) {
        if (isOwnProfileRequest && !authStore.isSessionTokenExpired()) {
          return Promise.reject(error);
        }

        authStore.logout();

        if (currentPath !== '/login') {
          await router.replace('/login');
        }
      }

      if (status === 403 && currentPath !== '/acess-denied') {
        await router.replace('/acess-denied');
      }

      return Promise.reject(error);
    },
  );
});

export { api };
