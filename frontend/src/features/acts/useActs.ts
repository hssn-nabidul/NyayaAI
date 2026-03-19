import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export interface BareAct {
  title: string;
  slug: string;
}

export interface Section {
  number: string;
  title: string;
  content: string;
}

export interface ActDetails {
  title: string;
  slug: string;
  sections: Section[];
}

export interface SectionDetailResponse {
  section: Section;
  act_title: string;
  related_cases: any[];
  total_cases: number;
}

export function useActs() {
  return useQuery<BareAct[]>({
    queryKey: ['acts'],
    queryFn: async () => {
      const response = await apiClient.get<BareAct[]>('/acts');
      return response || [];
    },
  });
}

export function useActDetails(slug: string) {
  return useQuery<ActDetails>({
    queryKey: ['acts', slug],
    queryFn: async () => {
      const response = await apiClient.get<ActDetails>(`/acts/${slug}`);
      return response;
    },
    enabled: !!slug,
  });
}

export function useSectionDetails(actSlug: string, sectionNumber: string) {
  return useQuery<SectionDetailResponse>({
    queryKey: ['acts', actSlug, 'sections', sectionNumber],
    queryFn: async () => {
      const response = await apiClient.get<SectionDetailResponse>(`/acts/${actSlug}/sections/${sectionNumber}`);
      return response;
    },
    enabled: !!actSlug && !!sectionNumber,
  });
}

export function useExplainSection(actSlug: string, sectionNumber: string) {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<any>(`/acts/${actSlug}/sections/${sectionNumber}/explain`, {});
      return response;
    },
  });
}

export function useSearchAct(actSlug: string, query: string) {
  return useQuery<Section[]>({
    queryKey: ['acts', actSlug, 'search', query],
    queryFn: async () => {
      const response = await apiClient.get<Section[]>(`/acts/${actSlug}/search`, { params: { q: query } } as any);
      return response;
    },
    enabled: !!actSlug && query.length > 2,
  });
}
