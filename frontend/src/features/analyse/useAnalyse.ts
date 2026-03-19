import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useUsageStore } from '@/lib/stores/usage.store';

export interface AnalyseResponse {
  analysis: {
    document_type: string;
    executive_summary: string;
    key_clauses_or_points: Array<{
      point: string;
      description: string;
    }>;
    potential_risks_or_issues: string[];
    suggested_next_steps: string[];
    legal_strengths: string[];
  };
  usage: {
    used: number;
    limit: number;
    remaining: number;
  };
}

export const useAnalyse = () => {
  const setUsage = useUsageStore((state) => state.setUsage);

  return useMutation<AnalyseResponse, Error, { doc_text: string }>({
    mutationFn: async ({ doc_text }) => {
      const response = await apiClient.post<AnalyseResponse>('/analyse/', { doc_text });
      setUsage(response.usage);
      return response;
    },
  });
};
