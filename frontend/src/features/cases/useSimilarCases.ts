import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useUsageStore } from '@/lib/stores/usage.store';

export interface SimilarCaseSuggestion {
  title: string;
  year: number;
  court: string;
  citation: string;
  shared_principle: string;
  relevance_score: number;
  reasoning: string;
}

export interface ThematicAnalysis {
  primary_area: string;
  core_principles: string[];
  relevant_statutes: string[];
  thematic_summary: string;
}

export interface SimilarCasesResponse {
  case_title: string;
  thematic_analysis: ThematicAnalysis;
  similar_cases: SimilarCaseSuggestion[];
  usage: {
    used: number;
    limit: number;
    remaining: number;
  };
}

export const useSimilarCases = (docId: string) => {
  const queryClient = useQueryClient();
  const setUsage = useUsageStore((state) => state.setUsage);

  return useMutation<SimilarCasesResponse, Error, void>({
    mutationFn: async () => {
      const response = await apiClient.post<SimilarCasesResponse>(
        `/cases/${docId}/similar`,
        {}
      );
      setUsage(response.usage);
      return response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['case-similar', docId], data);
    },
  });
};
