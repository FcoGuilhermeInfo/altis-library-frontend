import type { ROLES } from '@/constants/roles'
export type UserRole = (typeof ROLES)[keyof typeof ROLES]

export interface LoginRequest {
    email: string
    password: string
}

export interface LoginResponse {
    user_id: string
    token: string
    type: string
    expiresIn: number
}

export interface AuthenticatedUser {
    id: string
    email: string
    role: UserRole
}

export interface ForgotPasswordRequest {
  email: string
  cpf: string
}

export interface PasswordResetTokenResponse {
  token: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
  confirmPassword: string
}
