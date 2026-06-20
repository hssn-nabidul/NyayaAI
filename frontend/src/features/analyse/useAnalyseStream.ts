import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import { useUsageStore } from '@/lib/stores/usage.store';

export interface ChatRequest {
  query: string;
  context: string;
}

export interface AnalyseResponse {
  analysis: {
    document_type: string;
    executive_summary: string;
    key_clauses_or_points: Array<{
      point: string;
      description: string;
    }>;
    potential_risks_or_issues: string[];
    suggested_next_steps: string[];
    legal_strengths: string[];
  };
}

/**
 * useAnalyseStream — streams Q&A about a document to POST /analyse/stream.
 *
 * DUAL-MODE NOTE: The backend auto-detects whether a cached structured analysis
 * exists (from a prior POST /analyse/ call using the same context text).
 * - First call: Backend uses ANALYSE_STREAM_FIRST_PROMPT with full document text.
 * - Follow-up (cached analysis found): Backend uses ANALYSE_STREAM_FOLLOWUP_PROMPT
 *   with compressed context (~500-1,000 chars), saving ~90% Gemini tokens.
 *
 * The frontend always sends the full context — the backend handles compression.
 * The optional `analysis` prop is reserved for future UX enhancements
 * (e.g., showing a "Follow-up mode" indicator).
 */
export const useAnalyseStream = (_analysis?: AnalyseResponse['analysis']) => {
  const [data, setData] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const setUsage = useUsageStore((state) => state.setUsage);

  const stream = useCallback(
    async (request: ChatRequest) => {
      setIsLoading(true);
      setError(null);
      setData('');

      // Always send the full context. The backend handles dual-mode
      // via cached analysis detection (hashing context to find cached
      // structured analysis from POST /analyse/).
      try {
        await apiClient.stream(
          '/analyse/stream',
          { query: request.query, context: request.context },
          (chunk) => {
            setData((prev) => prev + chunk.replace(/\\n/g, '\n'));
          },
          (event, data) => {
            if (event === 'usage') {
              setUsage(data);
            }
          }
        );
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Streaming failed'));
      } finally {
        setIsLoading(false);
      }
    },
    [setUsage]
  );

  const reset = useCallback(() => {
    setData('');
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    stream,
    data,
    isLoading,
    error,
    reset
  };
};
