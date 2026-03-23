import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ExplainResponse } from '@/features/dictionary/useTermExplain';
import { useAuthStore } from '@/lib/stores/auth.store';

export const useMaximExplain = (term: string) => {
  const { user } = useAuthStore();
  
  return useQuery<ExplainResponse>({
    queryKey: ['maxim-explain', term],
    queryFn: async () => {
      if (!term) throw new Error('Maxim is required');
      if (!user) throw new Error('Authentication required');
      
      // Maxims use the same underlying explainer but with a "maxim" focus if needed
      return apiClient.get<ExplainResponse>(`/dictionary/explain?term=${encodeURIComponent(term)}`);
    },
    enabled: !!term && term.length >= 2 && !!user,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
