import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { CaseSummary } from '@/types/case';
import { useUsageStore } from '@/lib/stores/usage.store';

interface SummaryResponse {
  summary: CaseSummary;
  usage: {
    used: number;
    limit: number;
    remaining: number;
  };
}

export const useCaseSummary = (docId: string) => {
  const queryClient = useQueryClient();
  const setUsage = useUsageStore((state) => state.setUsage);

  return useMutation<SummaryResponse, Error, void>({
    mutationFn: async () => {
      const response = await apiClient.post<SummaryResponse>(`/cases/${docId}/summary`, {});
      setUsage(response.usage);
      return response;
    },
    onSuccess: (data) => {
      // We can cache the summary specifically for this case
      queryClient.setQueryData(['case-summary', docId], data);
    },
  });
};
