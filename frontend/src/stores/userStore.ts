import { create } from 'zustand';
import type { User, LoginResponse } from '../types';

interface UserState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  setLogin: (data: LoginResponse) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isLoggedIn: !!localStorage.getItem('token'),

  setLogin: (data: LoginResponse) => {
    const user: User = {
      id: data.userId,
      username: data.username,
      avatar: '',
      email: '',
      phone: '',
      department: '',
      jobRole: data.jobRole as User['jobRole'],
      roleName: '',
      level: data.level,
      levelName: '',
      points: data.points,
      bio: '',
      skillTags: '',
      createdAt: '',
    };
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token: data.token, isLoggedIn: true });
  },

  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isLoggedIn: false });
  },
}));
