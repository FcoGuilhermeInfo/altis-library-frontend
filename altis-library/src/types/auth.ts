export type UserRole = 'ROLE_ADMIN' | 'ROLE_USER'

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