import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { CaseDetail } from '@/types/case';

export const useCase = (docId: string) => {
  return useQuery<CaseDetail>({
    queryKey: ['case', docId],
    queryFn: async () => {
      if (!docId) throw new Error('Doc ID is required');
      return apiClient.get<CaseDetail>(`/cases/${docId}`);
    },
    enabled: !!docId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
