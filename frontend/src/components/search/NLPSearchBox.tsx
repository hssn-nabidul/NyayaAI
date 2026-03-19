'use client';

import React from 'react';
import { Sparkles, Loader2, AlertCircle, BookOpen, Scale, Gavel, X } from 'lucide-react';
import { useNLPSearch, NLPSearchResponse } from '@/features/search/useNLPSearch';

interface NLPSearchBoxProps {
  onResultsFound: (data: NLPSearchResponse) => void;
  onClear: () => void;
}

export default function NLPSearchBox({ onResultsFound, onClear }: NLPSearchBoxProps) {
  const [description, setDescription] = React.useState('');
  const [showAnalysis, setShowAnalysis] = React.useState(false);
  const { mutate: search, isPending, error, data } = useNLPSearch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 20) {
      alert("Please provide a more detailed description (at least 20 characters) for AI analysis.");
      return;
    }
    search({ description }, {
      onSuccess: (data) => {
        onResultsFound(data);
        setShowAnalysis(true);
      }
    });
  };

  const handleClear = () => {
    setDescription('');
    setShowAnalysis(false);
    onClear();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="relative group">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe a legal situation in plain English (e.g. 'A person was arrested without a warrant and not produced before a magistrate within 24 hours...')"
          className="w-full bg-gold/5 border border-gold/20 text-cream rounded-3xl p-6 pt-8 min-h-[140px] focus:outline-none focus:ring-1 focus:ring-gold/50 focus:border-gold/50 transition-all placeholder:text-gold/20 font-sans leading-relaxed resize-none shadow-inner"
        />
        
        <div className="absolute top-4 left-6 flex items-center gap-2 text-[10px] font-bold text-gold/40 uppercase tracking-[0.2em] pointer-events-none">
          <Sparkles size={12} />
          Natural Language Research
        </div>

        <div className="absolute bottom-4 right-4 flex items-center gap-3">
          {description && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-gold/40 hover:text-status-red transition-colors"
              title="Clear description"
            >
              <X size={20} />
            </button>
          )}
          <button
            type="submit"
            disabled={isPending || description.length < 20}
            className="bg-gold text-ink px-6 py-2 rounded-xl font-bold text-sm hover:bg-gold-light transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-gold/20"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analysing...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Search with AI
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-status-red/5 border border-status-red/10 rounded-2xl text-status-red text-sm animate-fade-up">
          <AlertCircle size={18} className="shrink-0" />
          <p>{error.message || "Failed to process AI search."}</p>
        </div>
      )}

      {showAnalysis && data && (
        <div className="bg-gold/5 border border-gold/10 rounded-3xl overflow-hidden animate-fade-up">
          <div className="px-6 py-4 bg-gold/10 border-b border-gold/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-gold">
              <Sparkles size={16} />
              <h3 className="font-serif font-bold text-sm tracking-tight">AI Legal Analysis</h3>
            </div>
            <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded border border-gold/20 font-bold tracking-widest uppercase">
              {data.ai_analysis.area_of_law}
            </span>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <section className="space-y-2">
              <div className="flex items-center gap-2 text-gold/60">
                <Scale size={14} />
                <h4 className="text-[10px] font-bold uppercase tracking-widest">Principles</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.ai_analysis.legal_principles.map((p, i) => (
                  <span key={i} className="text-[10px] bg-white/5 text-cream/60 px-2 py-1 rounded-md border border-white/5">{p}</span>
                ))}
              </div>
            </section>

            <section className="space-y-2">
              <div className="flex items-center gap-2 text-gold/60">
                <BookOpen size={14} />
                <h4 className="text-[10px] font-bold uppercase tracking-widest">Articles/Acts</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[...data.ai_analysis.relevant_articles, ...data.ai_analysis.relevant_acts_sections].map((a, i) => (
                  <span key={i} className="text-[10px] bg-white/5 text-cream/60 px-2 py-1 rounded-md border border-white/5">{a}</span>
                ))}
              </div>
            </section>

            <section className="space-y-2">
              <div className="flex items-center gap-2 text-gold/60">
                <Gavel size={14} />
                <h4 className="text-[10px] font-bold uppercase tracking-widest">Landmark Cases</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.ai_analysis.landmark_cases_to_include.map((c, i) => (
                  <span key={i} className="text-[10px] bg-white/5 text-cream/60 px-2 py-1 rounded-md border border-white/5 italic">{c}</span>
                ))}
              </div>
            </section>

            <section className="space-y-2">
               <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold/40">Usage</h4>
                  <span className="text-[10px] font-bold text-gold">{data.usage.remaining} left</span>
               </div>
               <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gold transition-all duration-1000" 
                    style={{ width: `${(data.usage.used / data.usage.limit) * 100}%` }}
                  />
               </div>
               <p className="text-[9px] text-cream/20 text-right italic">Optimised Query: {data.ai_analysis.kanoon_search_query}</p>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
