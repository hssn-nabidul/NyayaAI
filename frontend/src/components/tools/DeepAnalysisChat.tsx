import React, { useState, useRef, useEffect } from 'react';
import { useAnalyseStream } from '@/features/analyse/useAnalyseStream';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2, Sparkles, MessageSquare, Bot, User, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeepAnalysisChatProps {
  context: string;
}

export default function DeepAnalysisChat({ context }: DeepAnalysisChatProps) {
  const { stream, data, isLoading, error, reset } = useAnalyseStream();
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data, history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userQuery = query;
    setQuery('');
    setHistory(prev => [...prev, { role: 'user', content: userQuery }]);
    
    await stream({ query: userQuery, context });
  };

  // When streaming finishes, add to history
  useEffect(() => {
    if (!isLoading && data && history[history.length - 1]?.role === 'user') {
      setHistory(prev => [...prev, { role: 'assistant', content: data }]);
    }
  }, [isLoading, data]);

  return (
    <div className="flex flex-col h-[600px] bg-parchment border border-divider rounded-library shadow-lg overflow-hidden animate-fade-up">
      {/* Header */}
      <div className="p-6 border-b border-divider bg-ink text-parchment flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-library bg-gold flex items-center justify-center text-ink shadow-sm">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-sm font-serif italic tracking-wide">Nyaya Deep Analysis Chat</h3>
            <p className="text-[9px] uppercase tracking-[0.2em] text-gold/80 font-bold font-sans">Scholarly Interaction Engine</p>
          </div>
        </div>
        <button 
          onClick={() => { reset(); setHistory([]); }}
          className="text-parchment/40 hover:text-gold transition-colors p-2 rounded-library hover:bg-white/5"
          title="Clear Conversation"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 bg-parchment-dim scroll-smooth"
      >
        {history.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 px-12 py-24 border-2 border-dashed border-ink/5 rounded-library m-4">
            <MessageSquare size={48} className="text-ink/10" />
            <div className="space-y-2">
              <p className="text-lg font-serif italic">"Ask a scholarly question about this document's legal implications, precedents, or structural risks."</p>
              <p className="text-[10px] uppercase tracking-widest font-bold">Waiting for Inquiry</p>
            </div>
          </div>
        )}

        {history.map((msg, i) => (
          <div 
            key={i} 
            className={cn(
              "flex gap-4 max-w-[85%] animate-fade-in",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div className={cn(
              "w-8 h-8 shrink-0 rounded-library flex items-center justify-center shadow-sm",
              msg.role === 'user' ? "bg-gold text-ink" : "bg-ink text-parchment"
            )}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={cn(
              "p-5 rounded-library shadow-sm text-sm leading-relaxed font-sans border border-divider",
              msg.role === 'user' ? "bg-parchment text-ink rounded-tr-none" : "bg-white text-ink rounded-tl-none prose prose-ink prose-sm max-w-none"
            )}>
              {msg.role === 'user' ? (
                msg.content
              ) : (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 max-w-[85%] mr-auto animate-fade-in">
            <div className="w-8 h-8 shrink-0 rounded-library bg-ink text-parchment flex items-center justify-center shadow-sm">
              <Bot size={14} />
            </div>
            <div className="p-6 bg-white border border-divider rounded-library rounded-tl-none shadow-sm text-ink prose prose-ink prose-sm max-w-none">
              <ReactMarkdown>{data}</ReactMarkdown>
              <span className="inline-block w-2 h-4 ml-1 bg-gold animate-pulse align-middle" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 bg-parchment border-t border-divider shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a specific legal question about this transcript..."
            disabled={isLoading}
            className="flex-1 bg-parchment-dim border border-divider rounded-library px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-ink/20 focus:border-ink/20 transition-all font-sans disabled:opacity-50 shadow-inner"
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="bg-ink text-parchment px-6 py-4 rounded-library hover:bg-ink/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin text-gold" />
            ) : (
              <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            )}
          </button>
        </form>
        <p className="text-[9px] text-ink/20 mt-3 text-center uppercase tracking-widest font-bold font-sans">
          Institutional Analysis Engine &middot; Real-time Streaming Enabled
        </p>
      </div>
    </div>
  );
}
