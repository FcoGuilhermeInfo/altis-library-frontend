export interface BookRequest {
    title: string
    author: string
    releaseYear: number
    publisherName: string
    totalQuantity: number
}

export interface BookUpdateRequest {
    title?: string
    author?: string
    releaseYear?: number
    publisherName?: string
    totalQuantity: number
}

export interface BookResponse {
    id: string
    title: string
    author: string
    releaseYear: number
    publisherName: string
    totalQuantity: number
    availableQuantity: number
    borrowedQuantity: number
    createdAt: string
    updatedAt: string
}