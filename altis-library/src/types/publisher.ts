export interface PublisherRequest {
    name: string
    email: string
    phone: string
    site: string
}

export interface PublisherResponse {
    id: string
    name: string
    email: string
    phone: string
    site: string
    createdAt: string
    updatedAt: string
}