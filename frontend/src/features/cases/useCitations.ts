import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export interface CitationNode {
  id: string;
  title: string;
  type: 'root' | 'cites' | 'citedby';
  val: number;
}

export interface CitationLink {
  source: string;
  target: string;
  label: string;
}

export interface CitationGraphResponse {
  nodes: CitationNode[];
  links: CitationLink[];
}

export const useCitations = (docId: string) => {
  return useQuery<CitationGraphResponse>({
    queryKey: ['case-citations', docId],
    queryFn: async () => {
      if (!docId) throw new Error('Doc ID is required');
      return apiClient.get<CitationGraphResponse>(`/cases/${docId}/citations`);
    },
    enabled: !!docId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
