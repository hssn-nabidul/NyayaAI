import { useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { useUsageStore } from '@/lib/stores/usage.store';

export interface ChatRequest {
  query: string;
  context: string;
}

export const useAnalyseStream = () => {
  const [data, setData] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const setUsage = useUsageStore((state) => state.setUsage);

  const stream = async (request: ChatRequest) => {
    setIsLoading(true);
    setError(null);
    setData('');

    try {
      await apiClient.stream(
        '/analyse/stream',
        request,
        (chunk) => {
          // SSE data: chunk is already cleaned by apiClient
          // Handle potential literal \n representing actual newlines from SSE
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
  };

  const reset = () => {
    setData('');
    setError(null);
    setIsLoading(false);
  };

  return {
    stream,
    data,
    isLoading,
    error,
    reset
  };
};
