import { api } from '@/boot/axios'
import type { PasswordResetTokenResponse, ResetPasswordRequest, ForgotPasswordRequest, LoginRequest, LoginResponse } from '@/types/auth'

export const authService = {
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>('/auth/login',
        credentials,
    )


    return response.data
    },

    async forgotPassword(
        data: ForgotPasswordRequest, 
    ): Promise<PasswordResetTokenResponse> {
        const response = await api.post<PasswordResetTokenResponse>(
            '/auth/forgot-password',
            data,
        )
        return response.data
    },

    async resetPassword(
        data: ResetPasswordRequest,
    ): Promise<void> {
        await api.post('/auth/reset-password', data)
    },
}