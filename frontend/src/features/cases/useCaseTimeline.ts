import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { CaseTimeline } from '@/types/case';

export const useCaseTimeline = (docId: string) => {
  return useQuery<CaseTimeline, Error>({
    queryKey: ['case-timeline', docId],
    queryFn: async () => {
      return await apiClient.get<CaseTimeline>(`/cases/${docId}/timeline`);
    },
    enabled: !!docId,
    staleTime: Infinity, // Timeline doesn't change
  });
};
