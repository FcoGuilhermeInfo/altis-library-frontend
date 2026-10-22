import { api } from '@/boot/axios'
import type { RegisterRequest, UserResponse, PageResponse, } from '@/types/user'

export const userService = {
    async register(data: RegisterRequest): Promise<void> {
        await api.post('/users', data)
    },

    async findAll(
        search = '',
        page = 1,
        size = 10,
    ): Promise<PageResponse<UserResponse>> {
        const response = await api.get<PageResponse<UserResponse>>(
            '/users',
            {
                params: { search, page, size},
            },
        )

        return response.data
    },

    async findById(id: string): Promise<UserResponse> {
        const response = await api.get<UserResponse>(
            `/users/${id}`,
        )

        return response.data
    },

    async activate(id: string): Promise<UserResponse> {
        const response = await api.patch<UserResponse>(
             `/users/${id}/activate`,
        )

        return response.data
    },

    async inactivate(id: string): Promise<UserResponse> {
        const response = await api.patch<UserResponse>(
             `/users/${id}/inactivate`,
        )

        return response.data
    },
}