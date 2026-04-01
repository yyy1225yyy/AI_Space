import request from '../utils/request';
import type { LoginResponse, ApiResponse } from '../types';

interface RegisterParams {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  department?: string;
  jobRole: string;
}

interface LoginParams {
  username: string;
  password: string;
}

export const authService = {
  register: (data: RegisterParams) =>
    request.post<ApiResponse<LoginResponse>>('/auth/register', data),

  login: (data: LoginParams) =>
    request.post<ApiResponse<LoginResponse>>('/auth/login', data),
};
