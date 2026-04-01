import axios from 'axios';
import type { ApiResponse } from '../types';
import { API_BASE_URL } from '../constants';

const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// 请求拦截器 - 添加JWT Token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 统一处理错误
request.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResponse<unknown>;
    if (data.code !== 200) {
      // 401 未授权 - 清除token跳转登录
      if (data.code === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      const message = data?.message || error.message;
      return Promise.reject(new Error(message));
    }
    return Promise.reject(error);
  }
);

export default request;
