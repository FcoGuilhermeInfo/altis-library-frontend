import { api } from '@/boot/axios'
import type { RegisterRequest } from '@/types/user'

export const userService = {
    async register(data: RegisterRequest): Promise<void> {
        await api.post('/users', data)
    }
}