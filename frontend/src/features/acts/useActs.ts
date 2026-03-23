import { useMutation } from '@tanstack/react-query';
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

export interface ExplainResponse {
  section: string;
  act: string;
  simple_explanation: string;
  key_points: string[];
  illustration: string;
  related_sections: string[];
  related_cases: RelatedCase[];
}

/**
 * AI Explainer only activates on explicit button click.
 * Implements localStorage caching to prevent redundant API calls.
 */
export function useExplainSection(actSlug: string, sectionNumber: string) {
  return useMutation({
    mutationFn: async () => {
      const cacheKey = `section_explain_${actSlug}_${sectionNumber}`;
      
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
      const response = await apiClient.post<ExplainResponse>(`/acts/explain-section`, {
        act_slug: actSlug,
        section_number: sectionNumber
      });

      // Cache result if successful
      if (response) {
        localStorage.setItem(cacheKey, JSON.stringify(response));
      }

      return response;
    },
  });
}
