import { create } from 'zustand';

interface AuthModalState {
  isOpen: boolean;
  featureName: string;
  openModal: (featureName?: string) => void;
  closeModal: () => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  featureName: 'all AI features',
  openModal: (featureName = 'all AI features') => set({ isOpen: true, featureName }),
  closeModal: () => set({ isOpen: false }),
}));
