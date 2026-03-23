'use client';

import React, { useState } from 'react';
import { useTermExplain } from '@/features/dictionary/useTermExplain';
import { Search, Book, Sparkles, Scale, Info, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth.store';
import AuthGate from '@/components/auth/AuthGate';

export default function DictionaryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTerm, setActiveTerm] = useState('');
  const { user } = useAuthStore();
  const openAuthModal = useAuthModalStore((state) => state.openModal);

  const { data, isLoading, error, isFetching } = useTermExplain(activeTerm);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('AI Legal Dictionary');
      return;
    }
    if (searchTerm.trim().length >= 2) {
      setActiveTerm(searchTerm.trim());
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 px-4 md:px-6">
      {/* Header */}
      <div className="bg-ink-2/30 backdrop-blur-md p-8 md:p-12 rounded-[2.5rem] border border-white/5 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Book size={120} className="text-gold" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
              <Scale size={20} />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-gold tracking-tight">Legal Dictionary</h1>
          </div>
          <p className="text-cream/40 max-w-2xl text-sm md:text-base leading-relaxed">
            Understand complex legal terminology, Latin maxims, and judicial concepts used in Indian courts. 
            Powered by AI for contextual explanations.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative group max-w-2xl z-10">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gold group-focus-within:text-gold transition-colors duration-300 z-10" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search term (e.g. Res Judicata, Habeas Corpus...)"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-32 text-cream focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all font-medium"
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gold text-ink px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gold-light transition-all shadow-lg shadow-gold/10"
          >
            Explain
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {!activeTerm ? (
            <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/2 space-y-6">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                 <Sparkles size={40} className="text-cream/10" />
               </div>
               <div className="text-center space-y-2">
                <p className="text-cream/20 uppercase tracking-[0.3em] text-xs font-bold">Awaiting Input</p>
                <p className="text-cream/10 font-serif text-lg italic">"Enter a term to unlock AI-powered insight..."</p>
               </div>
            </div>
          ) : isLoading ? (
            <div className="h-[400px] flex flex-col items-center justify-center space-y-6">
              <Loader2 size={40} className="text-gold animate-spin" />
              <p className="text-cream/40 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Consulting AI Scholar...</p>
            </div>
          ) : error ? (
            <div className="bg-status-red/5 border border-status-red/10 rounded-3xl p-12 text-center space-y-4">
              <AlertCircle size={32} className="mx-auto text-status-red" />
              <h3 className="text-lg font-serif text-cream">Explanation Failed</h3>
              <p className="text-cream/40 text-sm">{error instanceof Error ? error.message : 'Failed to fetch explanation'}</p>
            </div>
          ) : data ? (
            <div className="space-y-6 animate-fade-up">
              <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gold/60">
                    <Info size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Definition</span>
                  </div>
                  <h2 className="text-3xl font-serif text-cream">
                    {typeof data.explanation.term === 'string' ? data.explanation.term : (data.explanation.term as any)?.text || 'Legal Term'}
                  </h2>
                  <p className="text-lg text-cream/80 leading-relaxed font-sans italic">
                    "{typeof data.explanation.definition === 'string' ? data.explanation.definition : (data.explanation.definition as any)?.text || 'Definition unavailable.'}"
                  </p>
                </div>

                <div className="h-px bg-white/5" />

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gold/60">
                    <Scale size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Application in India</span>
                  </div>
                  <p className="text-cream/70 leading-relaxed">
                    {typeof data.explanation.context_india === 'string' ? data.explanation.context_india : (data.explanation.context_india as any)?.text || 'Context unavailable.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gold/60">
                      <Sparkles size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Landmark Cases</span>
                    </div>
                    <ul className="space-y-2">
                      {data.explanation.landmark_cases.map((c, i) => (
                        <li key={i} className="flex items-start gap-3 text-xs text-cream/50">
                          <ChevronRight size={12} className="mt-0.5 text-gold/40 shrink-0" />
                          <span>{typeof c === 'string' ? c : (c as any)?.title || (c as any)?.name || String(c)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gold/60">
                      <Book size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Related Concepts</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.explanation.related_terms.map((t, i) => (
                        <button 
                          key={i}
                          onClick={() => {
                            setSearchTerm(t);
                            setActiveTerm(t);
                          }}
                          className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[10px] text-cream/40 hover:border-gold/30 hover:text-gold transition-all"
                        >
                          {typeof t === 'string' ? t : (t as any)?.text || String(t)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white/2 border border-white/5 rounded-3xl p-6 space-y-6 sticky top-24">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gold">Common Terms</h3>
            <div className="space-y-2">
              {['Ratio Decidendi', 'Obiter Dicta', 'Stare Decisis', 'Ultra Vires', 'Mens Rea', 'Ad Hoc'].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setSearchTerm(t);
                    setActiveTerm(t);
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-xs text-cream/40 hover:bg-white/5 hover:text-cream/60 transition-all flex items-center justify-between group"
                >
                  {t}
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-gold" />
                </button>
              ))}
            </div>

            {data && (
              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold">
                  <span className="text-cream/20">Daily Limit</span>
                  <span className="text-gold">{data.usage.remaining} / {data.usage.limit}</span>
                </div>
                <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gold transition-all duration-500" 
                    style={{ width: `${(data.usage.remaining / data.usage.limit) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
