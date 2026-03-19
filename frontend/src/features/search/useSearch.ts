import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { KanoonSearchResponse } from './search.types';

export interface SearchFilters {
  court?: string;
  from_year?: number;
  to_year?: number;
}

export const useSearch = (query: string, page: number = 0, filters: SearchFilters = {}) => {
  return useQuery<KanoonSearchResponse>({
    queryKey: ['search', query, page, filters],
    queryFn: async () => {
      if (!query || query.length < 2) return { query, total: 0, page: 0, results: [] };
      
      const params = new URLSearchParams({
        q: query,
        page: page.toString()
      });

      if (filters.court && filters.court !== 'all') {
        params.append('court', filters.court);
      }
      if (filters.from_year) {
        params.append('from_year', filters.from_year.toString());
      }
      if (filters.to_year) {
        params.append('to_year', filters.to_year.toString());
      }

      return apiClient.get<KanoonSearchResponse>(`/search/?${params.toString()}`);
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
};
