'use client';

import React from 'react';
import { Sparkles, Loader2, AlertCircle, BookOpen, Scale, Gavel, X, Info } from 'lucide-react';
import { useNLPSearch, NLPSearchResponse } from '@/features/search/useNLPSearch';
import { cn } from '@/lib/utils';

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
        <div className="absolute top-4 left-6 flex items-center gap-2 text-[10px] font-bold text-ink/30 uppercase tracking-[0.2em] pointer-events-none z-10">
          <Sparkles size={12} className="text-gold" />
          AI Legal Researcher
        </div>
        
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe a legal situation in plain English (e.g. 'A person was arrested without a warrant and not produced before a magistrate within 24 hours...')"
          className="w-full bg-parchment-dim border border-divider text-ink rounded-library p-6 pt-12 min-h-[160px] focus:outline-none focus:ring-1 focus:ring-ink/10 focus:border-ink/20 focus:bg-parchment transition-all placeholder:text-ink/20 font-sans leading-relaxed resize-none shadow-inner"
        />

        <div className="absolute bottom-4 right-4 flex items-center gap-3">
          {description && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-ink/20 hover:text-status-red transition-colors"
              title="Clear inquiry"
            >
              <X size={20} />
            </button>
          )}
          <button
            type="submit"
            disabled={isPending || description.length < 20}
            className="bg-ink text-parchment px-8 py-2.5 rounded-library font-bold text-sm hover:bg-ink/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Analyze & Search
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-status-red/5 border border-divider rounded-library text-status-red text-sm animate-fade-up shadow-sm">
          <AlertCircle size={18} className="shrink-0" />
          <p className="font-medium">{error.message || "Failed to process AI inquiry."}</p>
        </div>
      )}

      {showAnalysis && data && (
        <div className="bg-parchment border border-divider rounded-library overflow-hidden animate-fade-up shadow-sm">
          <div className="px-6 py-4 bg-parchment-dim border-b border-divider flex items-center justify-between">
            <div className="flex items-center gap-2 text-ink">
              <Sparkles size={16} className="text-gold" />
              <h3 className="font-serif font-bold text-sm tracking-tight">Institutional Analysis Brief</h3>
            </div>
            <span className="text-[9px] bg-ink text-parchment px-2 py-0.5 rounded-library font-bold tracking-widest uppercase shadow-sm">
              {data.ai_analysis.area_of_law}
            </span>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-ink/40">
                <Scale size={14} />
                <h4 className="text-[10px] font-bold uppercase tracking-widest">Principles</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.ai_analysis.legal_principles.map((p: any, i: number) => (
                  <span key={i} className="text-[10px] bg-parchment-dim text-ink/60 px-2 py-1 rounded-library border border-divider font-medium">{typeof p === 'string' ? p : p?.text || String(p)}</span>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-ink/40">
                <BookOpen size={14} />
                <h4 className="text-[10px] font-bold uppercase tracking-widest">Statutes/Acts</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[...data.ai_analysis.relevant_articles, ...data.ai_analysis.relevant_acts_sections].map((a: any, i: number) => (
                  <span key={i} className="text-[10px] bg-parchment-dim text-ink/60 px-2 py-1 rounded-library border border-divider font-medium">{typeof a === 'string' ? a : a?.text || a?.section || String(a)}</span>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-ink/40">
                <Gavel size={14} />
                <h4 className="text-[10px] font-bold uppercase tracking-widest">Precedents</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.ai_analysis.landmark_cases_to_include.map((c: any, i: number) => (
                  <span key={i} className="text-[10px] bg-parchment-dim text-ink/60 px-2 py-1 rounded-library border border-divider italic font-medium">{typeof c === 'string' ? c : c?.title || c?.name || String(c)}</span>
                ))}
              </div>
            </section>

            <section className="space-y-4">
               <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink/30">AI Folio Limit</h4>
                  <span className="text-[10px] font-bold text-gold">{data.usage.remaining} left</span>
               </div>
               <div className="h-1.5 w-full bg-divider rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gold transition-all duration-1000" 
                    style={{ width: `${(data.usage.used / data.usage.limit) * 100}%` }}
                  />
               </div>
               <div className="pt-2 flex items-start gap-2 border-t border-divider border-dashed">
                 <Info size={12} className="text-gold shrink-0 mt-0.5" />
                 <p className="text-[9px] text-ink/30 italic leading-relaxed">Generated Archive Query: "{data.ai_analysis.kanoon_search_query}"</p>
               </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
