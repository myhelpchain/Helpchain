import { create } from 'zustand';

type UserRole = 'seeker' | 'helper' | 'admin' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isVerified?: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, role: UserRole) => Promise<void>;
  logout: () => void;
  signup: (data: any) => Promise<void>;
}

export const useMockAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  login: async (email: string, role: UserRole = 'seeker') => {
    set({ isLoading: true });
    // Simulate API call to "Owner Database"
    await new Promise(resolve => setTimeout(resolve, 1500));
    set({
      isLoading: false,
      user: {
        id: '123',
        name: 'Alex Johnson',
        email,
        role,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        isVerified: true
      }
    });
  },
  signup: async (data: any) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 2000));
    set({
      isLoading: false,
      user: {
        id: '123',
        name: data.name || 'New User',
        email: data.email,
        role: 'seeker', // Default
        isVerified: false
      }
    });
  },
  logout: () => set({ user: null })
}));