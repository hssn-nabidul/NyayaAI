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

export interface SectionExplainRequest {
  act_id: string;
  section_number: string;
  section_title: string;
  section_text: string;
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
