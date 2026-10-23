
import { api } from '@/boot/axios'

import type {
  LoanRequest,
  LoanResponse,
} from '@/types/loan'

import type { PageResponse } from '@/types/paginations'

export const loanService = {
  async findAll(
    search = '',
    page = 1,
    size = 10,
  ): Promise<PageResponse<LoanResponse>> {
    const response = await api.get<PageResponse<LoanResponse>>(
      '/loans',
      {
        params: { search, page, size },
      },
    )

    return response.data
  },

  async findHistory(
    search = '',
    page = 1,
    size = 10,
  ): Promise<PageResponse<LoanResponse>> {
    const response = await api.get<PageResponse<LoanResponse>>(
      '/loans/history',
      {
        params: { search, page, size },
      },
    )

    return response.data
  },

  async findById(id: string): Promise<LoanResponse> {
    const response = await api.get<LoanResponse>(
      `/loans/${id}`,
    )

    return response.data
  },

  async create(data: LoanRequest): Promise<LoanResponse> {
    const response = await api.post<LoanResponse>(
      '/loans',
      data,
    )

    return response.data
  },

  async returnBook(id: string): Promise<LoanResponse> {
    const response = await api.patch<LoanResponse>(
      `/loans/${id}`,
    )

    return response.data
  },
}
