import { create } from 'zustand';

interface UsageState {
  used: number;
  limit: number;
  remaining: number;
  setUsage: (usage: { used: number; limit: number; remaining: number }) => void;
}

export const useUsageStore = create<UsageState>((set) => ({
  used: 0,
  limit: 50,
  remaining: 50,
  setUsage: (usage) => set(usage),
}));
