import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useUsageStore } from '@/lib/stores/usage.store';

export interface DraftSuggestion {
  title: string;
  court: string;
  year: number;
  citation: string;
  reason: string;
  relevance_score: number;
}

export interface DraftResponse {
  detected_arguments: string[];
  suggestions: DraftSuggestion[];
  usage: {
    used: number;
    limit: number;
    remaining: number;
  };
}

export const useDraftSuggest = () => {
  const setUsage = useUsageStore((state) => state.setUsage);

  return useMutation<DraftResponse, Error, { draft_text: string }>({
    mutationFn: async ({ draft_text }) => {
      const response = await apiClient.post<DraftResponse>('/draft/suggest', { draft_text });
      setUsage(response.usage);
      return response;
    },
  });
};
