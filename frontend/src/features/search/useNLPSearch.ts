import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useUsageStore } from '@/lib/stores/usage.store';
import { KanoonSearchResponse } from './search.types';

export interface NLPAnalysis {
  legal_principles: string[];
  relevant_articles: string[];
  relevant_acts_sections: string[];
  landmark_cases_to_include: string[];
  kanoon_search_query: string;
  area_of_law: string;
}

export interface NLPSearchResponse {
  results: KanoonSearchResponse;
  ai_analysis: NLPAnalysis;
  usage: {
    used: number;
    limit: number;
    remaining: number;
  };
}

export const useNLPSearch = () => {
  const setUsage = useUsageStore((state) => state.setUsage);

  return useMutation<NLPSearchResponse, Error, { description: string }>({
    mutationFn: async ({ description }) => {
      const response = await apiClient.post<NLPSearchResponse>('/search/nlp', { description });
      setUsage(response.usage);
      return response;
    },
  });
};
