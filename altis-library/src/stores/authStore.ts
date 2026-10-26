
import { i18n } from '@/utils/i18n';
import { getApiErrorKey } from '@/utils/apiErrors';
import { unexpectedResponse } from '@/utils/apiResponses';

import { ROLES } from '@/constants/roles';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { jwtDecode } from 'jwt-decode';
import { authService } from '@/services/authService';
import { saveToken, getToken, clearToken } from '@/utils/tokenStorage';

import type {
  AuthenticatedUser,
  LoginRequest,
  LoginResponse,
  UserRole,
} from '@/types/auth';

interface JwtPayload {
  sub?: string;
  userId?: string;
  user_id?: string;
  id?: string;
  email?: string;
  role?: UserRole;
  exp?: number;
}

function isValidPayload(payload: JwtPayload): boolean {
  const email = payload.sub ?? payload.email;
  const userId = payload.userId ?? payload.user_id ?? payload.id;
  const expiration = Number(payload.exp ?? 0);

  return (
    typeof email === 'string' &&
    email.trim().length > 0 &&
    typeof userId === 'string' &&
    userId.trim().length > 0 &&
    (payload.role === ROLES.ADMIN || payload.role === ROLES.USER) &&
    Number.isFinite(expiration) &&
    expiration > 0 &&
    expiration * 1000 > Date.now()
  );
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthenticatedUser | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);
  const errorKey = ref<string | null>(null);

  const error = computed(() =>
    errorKey.value ? i18n.global.t(errorKey.value) : null,
  );

  const isAdmin = computed(() => user.value?.role === ROLES.ADMIN);
  const isUser = computed(() => user.value?.role === ROLES.USER);

  const isAuthenticated = () =>
    user.value !== null && token.value !== null;

  function isSessionTokenExpired(): boolean {
    if (!token.value) return true;

    try {
      const expiration = Number(
        jwtDecode<JwtPayload>(token.value).exp ?? 0,
      );

      return (
        !Number.isFinite(expiration) ||
        expiration <= 0 ||
        expiration * 1000 <= Date.now()
      );
    } catch {
      return true;
    }
  }

  async function login(credentials: LoginRequest): Promise<void> {
    loading.value = true;
    errorKey.value = null;

    try {
      const response: LoginResponse = await authService.login(credentials);
      const payload = jwtDecode<JwtPayload>(response.token);

      const userId = payload.userId ?? payload.user_id ?? payload.id;

      if (
        !isValidPayload(payload) ||
        typeof userId !== 'string' ||
        userId.trim().length === 0 ||
        (response.user_id != null && response.user_id !== userId)
      ) {
        unexpectedResponse();
      }

      token.value = response.token;

      user.value = {
        id: userId,
        email: payload.sub ?? payload.email ?? userId,
        role: payload.role ?? ROLES.USER,
      };

      saveToken(response.token);
    } catch (err: unknown) {
      user.value = null;
      token.value = null;
      clearToken();

      errorKey.value = getApiErrorKey(err, 'login.error');

      throw err;
    } finally {
      loading.value = false;
    }
  }

  function logout(): void {
    user.value = null;
    token.value = null;
    errorKey.value = null;

    clearToken();
  }

  function expireSession(): void {
    user.value = null;
    token.value = null;
    errorKey.value = 'errors.sessionExpired';

    clearToken();
  }

  function restoreSession(): void {
    const savedToken = getToken();

    if (!savedToken) return;

    try {
      const payload = jwtDecode<JwtPayload>(savedToken);

      if (!isValidPayload(payload)) {
        logout();
        return;
      }

      const userId = payload.userId ?? payload.user_id ?? payload.id;

      token.value = savedToken;

      user.value = {
        id: userId ?? '',
        email: payload.sub ?? payload.email ?? '',
        role: payload.role ?? ROLES.USER,
      };
    } catch {
      logout();
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isSessionTokenExpired,
    isAdmin,
    isUser,
    login,
    logout,
    expireSession,
    restoreSession,
  };
});
