export interface RegisterRequest {
    name: string
    birthDate: string
    cpf: string
    phone: string
    address: string
    email: string
    password: string
}

export interface UserResponse {
    id: string
    name: string
    birthDate: string
    cpf: string
    phone: string
    address: string
    email: string
    admin: boolean
    active: boolean
    createdAt: string
    updatedAt: string
}

export interface PageResponse<T> {
    content: T[]
    totalElements: number
    totalPages: number
    number: number
    size: number
    first: boolean
    last: boolean
}