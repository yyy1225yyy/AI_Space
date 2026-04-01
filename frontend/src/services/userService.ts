import request from '../utils/request';
import type { User, ApiResponse } from '../types';

export const userService = {
  getCurrentUser: () =>
    request.get<ApiResponse<User>>('/users/me'),

  getUserById: (id: number) =>
    request.get<ApiResponse<User>>(`/users/${id}`),

  updateUser: (id: number, data: Partial<User>) =>
    request.put<ApiResponse<User>>(`/users/${id}`, data),

  updateJobRole: (id: number, jobRole: string) =>
    request.put<ApiResponse<User>>(`/users/${id}/job-role`, null, { params: { jobRole } }),
};
