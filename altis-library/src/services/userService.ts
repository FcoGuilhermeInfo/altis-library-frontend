import { api } from '@/boot/axios';
import type { RegisterRequest, UserResponse } from '@/types/user';
import type { PageResponse } from '@/types/paginations';

const pendingUserRequests = new Map<string, Promise<UserResponse>>();

export const userService = {
  async register(data: RegisterRequest): Promise<void> {
    await api.post('/users', data);
  },

  async findAll(search = '', page = 1, size = 10): Promise<PageResponse<UserResponse>> {
    const response = await api.get<PageResponse<UserResponse>>('/users', {
      params: { search, page, size },
    });

    return response.data;
  },

  async findById(id: string): Promise<UserResponse> {
    const pendingRequest = pendingUserRequests.get(id);
    if (pendingRequest) return pendingRequest;

    const request = api.get<UserResponse>(`/users/${id}`).then((response) => response.data);
    pendingUserRequests.set(id, request);

    try {
      return await request;
    } finally {
      if (pendingUserRequests.get(id) === request) {
        pendingUserRequests.delete(id);
      }
    }
  },

  async activate(id: string): Promise<UserResponse> {
    const response = await api.patch<UserResponse>(`/users/${id}/activate`);

    return response.data;
  },

  async inactivate(id: string): Promise<UserResponse> {
    const response = await api.patch<UserResponse>(`/users/${id}/inactivate`);

    return response.data;
  },
};
