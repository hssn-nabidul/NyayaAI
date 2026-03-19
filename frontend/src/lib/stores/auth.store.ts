import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  idToken: string | null;
  isLoading: boolean;
  setUser: (user: User | null, idToken?: string | null) => void;
  setIdToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  idToken: null,
  isLoading: true,
  setUser: (user, idToken) => set((state) => ({ 
    user, 
    idToken: idToken !== undefined ? idToken : state.idToken 
  })),
  setIdToken: (idToken) => set({ idToken }),
  setLoading: (isLoading) => set({ isLoading }),
}));
