import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export interface Section {
  number: string;
  title: string;
  content: string;
}

export interface RelatedCase {
  title: string;
  citation: string;
  relevance: string;
}

export interface SectionCase {
  doc_id: string;
  title: string;
  court: string;
  date: string;
  headline: string;
}

export interface SectionCasesResponse {
  act: string;
  section: string;
  total: number;
  results: SectionCase[];
}

export interface ExplainResponse {
  section: string;
  act: string;
  simple_explanation: string;
  key_points: string[];
  illustration: string;
  related_sections: string[];
  related_cases: RelatedCase[];
}

export interface SectionExplainRequest {
  act_id: string;
  section_number: string;
  section_title: string;
  section_text: string;
}

/**
 * Fetch actual judgments that interpret or cite a specific bare act section.
 */
export function useSectionCases(actSlug: string, sectionNumber: string | null) {
  return useQuery({
    queryKey: ['section-cases', actSlug, sectionNumber],
    queryFn: () => apiClient.get<SectionCasesResponse>(`/acts/${actSlug}/sections/${sectionNumber}/cases`),
    enabled: !!sectionNumber && !!actSlug,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (cases don't change that fast)
  });
}

/**
 * AI Explainer only activates on explicit button click.
 * Implements localStorage caching to prevent redundant API calls.
 */
export function useExplainSection() {
  return useMutation({
    mutationFn: async (request: SectionExplainRequest) => {
      const { act_id, section_number } = request;
      const cacheKey = `section_explain_${act_id}_${section_number}`;
      
      // Check localStorage first
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          return JSON.parse(cachedData) as ExplainResponse;
        } catch (e) {
          localStorage.removeItem(cacheKey);
        }
      }

      // If not cached, call API
      const response = await apiClient.post<ExplainResponse>(`/acts/explain-section`, request);

      // Cache result if successful
      if (response) {
        localStorage.setItem(cacheKey, JSON.stringify(response));
      }

      return response;
    },
  });
}
