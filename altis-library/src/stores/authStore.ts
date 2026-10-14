
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { jwtDecode } from 'jwt-decode'
import { authService } from '@/services/authService'
import type {
  AuthenticatedUser,
  LoginRequest,
  LoginResponse,
  UserRole,
} from '@/types/auth'

interface JwtPayload {
  sub: string
  userId: string
  role: UserRole
  exp: number
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthenticatedUser | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = () => {
    return user.value !== null && token.value !== null
  }

  async function login(credentials: LoginRequest): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const response: LoginResponse = await authService.login(credentials)

      const payload = jwtDecode<JwtPayload>(response.token)

      if (
        !payload.userId ||
        !payload.sub ||
        (payload.role !== 'ROLE_ADMIN' && payload.role !== 'ROLE_USER')
      ) {
        throw new Error('O token recebido possui dados inválidos.')
      }

      if (payload.exp * 1000 <= Date.now()) {
        throw new Error('O token recebido já expirou.')
      }

      token.value = response.token

      user.value = {
        id: response.user_id,
        email: payload.sub,
        role: payload.role,
      }
    } catch (err: unknown) {
      user.value = null
      token.value = null

      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'Não foi possível realizar o login.'
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  function logout(): void {
    user.value = null
    token.value = null
    error.value = null
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
  }
})
