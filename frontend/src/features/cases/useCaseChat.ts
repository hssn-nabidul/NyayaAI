import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import { useUsageStore } from '@/lib/stores/usage.store';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface UseCaseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: Error | null;
  streamQuery: (query: string) => Promise<void>;
  reset: () => void;
}

export const useCaseChat = (docId: string): UseCaseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [historyBuilt, setHistoryBuilt] = useState(false);
  const setUsage = useUsageStore((state) => state.setUsage);

  const buildHistoryString = useCallback((msgs: ChatMessage[]): string => {
    // Only include the last 2 exchanges to avoid token bloat
    const recentMsgs = msgs.slice(-4); // last 2 user + 2 assistant messages
    return recentMsgs
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');
  }, []);

  const streamQuery = useCallback(
    async (query: string) => {
      setIsLoading(true);
      setError(null);

      const isAutoSummary = query === '';

      // Add user message (skip for auto-summary to avoid empty bubble)
      if (!isAutoSummary) {
        const userMsg: ChatMessage = { role: 'user', content: query };
        setMessages((prev) => [...prev, userMsg]);
      }

      // Build conversation history string
      const currentHistory = buildHistoryString(
        historyBuilt ? messages : []
      );

      try {
        await apiClient.stream(
          `/cases/${docId}/chat`,
          { query, history: currentHistory },
          (chunk) => {
            // SSE data: chunks arrive one by one
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              // If the last message is from the assistant, append to it
              if (last && last.role === 'assistant') {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content + chunk.replace(/\\n/g, '\n'),
                };
                return updated;
              }
              // Otherwise, start a new assistant message
              return [
                ...prev,
                { role: 'assistant' as const, content: chunk.replace(/\\n/g, '\n') },
              ];
            });
          },
          (event, data) => {
            if (event === 'usage') {
              setUsage(data);
            }
          }
        );

        setHistoryBuilt(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Chat failed'));
        setMessages((prev) => prev.slice(0, -1)); // Remove the user message on error
      } finally {
        setIsLoading(false);
      }
    },
    [docId, messages, historyBuilt, buildHistoryString, setUsage]
  );

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
    setIsLoading(false);
    setHistoryBuilt(false);
  }, []);

  return {
    messages,
    isLoading,
    error,
    streamQuery,
    reset,
  };
};
