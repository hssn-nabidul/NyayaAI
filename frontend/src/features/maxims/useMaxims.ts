import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ExplainResponse } from '@/features/dictionary/useTermExplain';

export const useMaximExplain = (term: string) => {
  return useQuery<ExplainResponse>({
    queryKey: ['maxim-explain', term],
    queryFn: async () => {
      if (!term) throw new Error('Maxim is required');
      // Maxims use the same underlying explainer but with a "maxim" focus if needed
      return apiClient.get<ExplainResponse>(`/dictionary/explain?term=${encodeURIComponent(term)}`);
    },
    enabled: !!term && term.length >= 2,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
