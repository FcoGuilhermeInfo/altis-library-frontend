
import { api } from '@/boot/axios'

import type {
  BookRequest,
  BookUpdateRequest,
  BookResponse,
} from '@/types/book'

import type { PageResponse } from '@/types/paginations'

export const bookService = {
  async findAll(
    search = '',
    page = 1,
    size = 10,
  ): Promise<PageResponse<BookResponse>> {
    const response = await api.get<PageResponse<BookResponse>>(
      '/books',
      {
        params: { search, page, size },
      },
    )

    return response.data
  },

  async findById(id: string): Promise<BookResponse> {
    const response = await api.get<BookResponse>(
      `/books/${id}`,
    )

    return response.data
  },

  async create(data: BookRequest): Promise<BookResponse> {
    const response = await api.post<BookResponse>(
      '/books',
      data,
    )

    return response.data
  },

  async update(
    id: string,
    data: BookUpdateRequest,
  ): Promise<BookResponse> {
    const response = await api.patch<BookResponse>(
      `/books/${id}`,
      data,
    )

    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/books/${id}`)
  },
}
