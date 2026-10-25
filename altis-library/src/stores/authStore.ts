import { i18n } from '@/utils/i18n';
import { getApiErrorKey } from '@/utils/apiErrors';

import { ROLES } from '@/constants/roles';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { jwtDecode } from 'jwt-decode';
import { authService } from '@/services/authService';
import { saveToken, getToken, clearToken } from '@/utils/tokenStorage';
import { unexpectedResponse } from '@/utils/apiResponses';

import type { AuthenticatedUser, LoginRequest, LoginResponse, UserRole } from '@/types/auth';

interface JwtPayload {
  sub: string;
  userId: string;
  role: UserRole;
  exp: number;
}

function isValidPayload(payload: JwtPayload): boolean {
  return (
    typeof payload.sub === 'string' &&
    payload.sub.trim().length > 0 &&
    typeof payload.userId === 'string' &&
    payload.userId.trim().length > 0 &&
    (payload.role === ROLES.ADMIN || payload.role === ROLES.USER) &&
    typeof payload.exp === 'number' &&
    Number.isFinite(payload.exp) &&
    payload.exp * 1000 > Date.now()
  );
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthenticatedUser | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);
  const errorKey = ref<string | null>(null);
  const error = computed(() => (errorKey.value ? i18n.global.t(errorKey.value) : null));

  const isAdmin = computed(() => user.value?.role === ROLES.ADMIN);
  const isUser = computed(() => user.value?.role === ROLES.USER);

  const isAuthenticated = () => {
    return user.value !== null && token.value !== null;
  };

  async function login(credentials: LoginRequest): Promise<void> {
    loading.value = true;
    errorKey.value = null;

    try {
      const response: LoginResponse = await authService.login(credentials);
      const payload = jwtDecode<JwtPayload>(response.token);

      if (
        !isValidPayload(payload) ||
        typeof response.user_id !== 'string' ||
        response.user_id !== payload.userId
      ) {
        unexpectedResponse();
      }

      token.value = response.token;

      user.value = {
        id: response.user_id,
        email: payload.sub,
        role: payload.role,
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

    if (!savedToken) {
      return;
    }

    try {
      const payload = jwtDecode<JwtPayload>(savedToken);

      if (!isValidPayload(payload)) {
        logout();
        return;
      }

      token.value = savedToken;

      user.value = {
        id: payload.userId,
        email: payload.sub,
        role: payload.role,
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
    isAdmin,
    isUser,
    login,
    logout,
    expireSession,
    restoreSession,
  };
});
