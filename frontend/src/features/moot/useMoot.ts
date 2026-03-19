import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useUsageStore } from '@/lib/stores/usage.store';

export interface MootArgument {
  heading: string;
  body: string;
  supporting_cases: Array<{
    title: string;
    year: number;
    citation: string;
    relevance: string;
  }>;
}

export interface MootSideAnalysis {
  arguments: MootArgument[];
  key_cases: string[];
  anticipated_counter: string;
}

export interface MootResponse {
  proposition: string;
  side: string;
  analysis: {
    petitioner?: MootSideAnalysis;
    respondent?: MootSideAnalysis;
  };
  usage: {
    used: number;
    limit: number;
    remaining: number;
  };
}

export const useMoot = () => {
  const setUsage = useUsageStore((state) => state.setUsage);

  return useMutation<MootResponse, Error, { proposition: string; side: string; format: string }>({
    mutationFn: async (data) => {
      const response = await apiClient.post<MootResponse>('/moot/prep', data);
      setUsage(response.usage);
      return response;
    },
  });
};
