
import { api } from '@/boot/axios'

import type {
  PublisherRequest,
  PublisherResponse,
} from '@/types/publisher'

import type { PageResponse } from '@/types/paginations'

export const publisherService = {
  async findAll(
    search = '',
    page = 1,
    size = 10,
  ): Promise<PageResponse<PublisherResponse>> {
    const response = await api.get<PageResponse<PublisherResponse>>(
      '/publishers',
      {
        params: { search, page, size },
      },
    )

    return response.data
  },

  async findById(id: string): Promise<PublisherResponse> {
    const response = await api.get<PublisherResponse>(
      `/publishers/${id}`,
    )

    return response.data
  },

  async create(
    data: PublisherRequest,
  ): Promise<PublisherResponse> {
    const response = await api.post<PublisherResponse>(
      '/publishers',
      data,
    )

    return response.data
  },

  async update(
    id: string,
    data: PublisherRequest,
  ): Promise<PublisherResponse> {
    const response = await api.patch<PublisherResponse>(
      `/publishers/${id}`,
      data,
    )

    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/publishers/${id}`)
  },
}
