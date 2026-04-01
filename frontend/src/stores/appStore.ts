import { create } from 'zustand';
import type { JobRole } from '../types';

interface AppState {
  currentJobRole: JobRole | 'all';
  setCurrentJobRole: (role: JobRole | 'all') => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentJobRole: 'all',
  setCurrentJobRole: (role) => set({ currentJobRole: role }),
}));
