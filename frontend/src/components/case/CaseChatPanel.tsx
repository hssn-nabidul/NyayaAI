'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCaseChat } from '@/features/cases/useCaseChat';
import ReactMarkdown from 'react-markdown';
import { useUsageStore } from '@/lib/stores/usage.store';
import {
  Sparkles,
  Loader2,
  Send,
  Bot,
  User,
  Trash2,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CaseChatPanelProps {
  docId: string;
}

export default function CaseChatPanel({ docId }: CaseChatPanelProps) {
  const { messages, isLoading, error, streamQuery, reset } = useCaseChat(docId);
  const [query, setQuery] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const remaining = useUsageStore((state) => state.remaining);
  const limit = useUsageStore((state) => state.limit);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-start summarization when component mounts
  const handleStartAnalysis = async () => {
    setHasStarted(true);
    await streamQuery('');
    // Focus the input after the summary is done
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userQuery = query;
    setQuery('');
    await streamQuery(userQuery);
  };

  // Initial state: Show a clean "Analyze" button
  if (!hasStarted) {
    return (
      <div className="bg-parchment border border-divider rounded-library overflow-hidden shadow-sm">
        <div className="p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-library bg-ink/5 border border-divider flex items-center justify-center">
            <Sparkles size={32} className="text-gold" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-serif font-bold text-ink">
              AI Case Analysis
            </h3>
            <p className="text-sm text-ink/60 leading-relaxed max-w-sm mx-auto">
              Get a comprehensive AI summary, then ask follow-up questions
              about this judgment.
            </p>
          </div>
          <button
            onClick={handleStartAnalysis}
            className="inline-flex items-center gap-2 px-8 py-3 bg-ink text-parchment rounded-library font-bold text-[11px] uppercase tracking-widest hover:bg-gold transition-all shadow-sm hover:shadow-md"
          >
            <Sparkles size={16} />
            Analyze with AI
          </button>
          <p className="text-[9px] text-ink/30 font-medium">
            {remaining} / {limit} daily AI inquiries remaining
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-parchment border border-divider rounded-library overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-divider bg-ink/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-library bg-ink text-parchment flex items-center justify-center">
            <Sparkles size={14} className="text-gold" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink">
            AI Analysis
          </span>
        </div>
        <button
          onClick={reset}
          className="p-1.5 hover:bg-ink/5 rounded-library text-ink/30 hover:text-status-red transition-colors"
          title="Clear conversation"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px] min-h-[300px] scroll-smooth"
      >
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
            <MessageSquare size={32} className="text-ink/10" />
            <p className="text-xs text-ink/40 italic">
              Summarizing the case...
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              'flex gap-3 max-w-[90%] animate-fade-up',
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            )}
          >
            <div
              className={cn(
                'w-7 h-7 shrink-0 rounded-library flex items-center justify-center shadow-sm',
                msg.role === 'user'
                  ? 'bg-gold text-ink'
                  : 'bg-ink text-parchment'
              )}
            >
              {msg.role === 'user' ? <User size={13} /> : <Bot size={13} />}
            </div>
            <div
              className={cn(
                'p-4 rounded-library text-sm leading-relaxed border border-divider shadow-sm',
                msg.role === 'user'
                  ? 'bg-ink/5 text-ink rounded-tr-none'
                  : 'bg-white text-ink rounded-tl-none prose prose-ink prose-sm max-w-none'
              )}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-3 max-w-[90%] mr-auto animate-fade-up">
            <div className="w-7 h-7 shrink-0 rounded-library bg-ink text-parchment flex items-center justify-center shadow-sm">
              <Bot size={13} />
            </div>
            <div className="p-4 bg-white border border-divider rounded-library rounded-tl-none shadow-sm">
              <div className="flex items-center gap-2 text-ink/40">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-[10px] font-medium italic">
                  Researching...
                </span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-status-red/5 border border-status-red/20 rounded-library text-status-red text-xs">
            <AlertCircle size={14} />
            <span>Failed to get response. Please try again.</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-divider bg-parchment-dim">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a follow-up about this case..."
            disabled={isLoading}
            className="flex-1 bg-white border border-divider rounded-library px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ink/20 focus:border-ink/20 transition-all disabled:opacity-50 shadow-inner"
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="bg-ink text-parchment px-5 py-2.5 rounded-library hover:bg-ink/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin text-gold" />
            ) : (
              <Send
                size={16}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              />
            )}
          </button>
        </form>
          <p className="text-[9px] text-ink/20 mt-2 text-center uppercase tracking-widest font-medium">
            {remaining} / {limit} inquiries remaining
          </p>
      </div>
    </div>
  );
}
