import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useUsageStore } from '@/lib/stores/usage.store';

export interface TermExplanation {
  term: string;
  definition: string;
  context_india: string;
  landmark_cases: string[];
  related_terms: string[];
}

export interface ExplainResponse {
  term: string;
  explanation: TermExplanation;
  usage: {
    used: number;
    limit: number;
    remaining: number;
  };
}

export const useTermExplain = (term: string) => {
  const setUsage = useUsageStore((state) => state.setUsage);

  return useQuery<ExplainResponse>({
    queryKey: ['term-explain', term],
    queryFn: async () => {
      if (!term) throw new Error('Term is required');
      const response = await apiClient.get<ExplainResponse>(`/dictionary/explain?term=${encodeURIComponent(term)}`);
      setUsage(response.usage);
      return response;
    },
    enabled: !!term && term.length >= 2,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
