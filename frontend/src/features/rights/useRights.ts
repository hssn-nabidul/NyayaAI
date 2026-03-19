import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useUsageStore } from '@/lib/stores/usage.store';

export interface RightExplanation {
  right_name: string;
  article: string;
  simple_explanation: string;
  what_you_can_do: string[];
  landmark_cases: string[];
  remedy: string;
}

export interface RightsResponse {
  query: string;
  explanation: RightExplanation;
  usage: {
    used: number;
    limit: number;
    remaining: number;
  };
}

export const useRights = (query: string) => {
  const setUsage = useUsageStore((state) => state.setUsage);

  return useQuery<RightsResponse>({
    queryKey: ['rights-explain', query],
    queryFn: async () => {
      if (!query) throw new Error('Query is required');
      const response = await apiClient.get<RightsResponse>(`/rights/explain?q=${encodeURIComponent(query)}`);
      setUsage(response.usage);
      return response;
    },
    enabled: !!query && query.length >= 3,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
