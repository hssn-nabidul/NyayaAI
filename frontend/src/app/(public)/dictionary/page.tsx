'use client';

import React, { useState, useEffect } from 'react';
import { useTermExplain } from '@/features/dictionary/useTermExplain';
import { Search, Book, Sparkles, Scale, Info, Loader2, AlertCircle, ChevronRight, Library, Quote, Gavel } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useAuthModalStore } from '@/lib/stores/auth-modal.store';
import AuthGate from '@/components/auth/AuthGate';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function DictionaryPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [activeTerm, setActiveTerm] = useState('');
  const { user } = useAuthStore();
  const openAuthModal = useAuthModalStore((state) => state.openModal);

  // Auto-trigger search if query exists and user is logged in
  useEffect(() => {
    if (initialQuery && user) {
      setActiveTerm(initialQuery);
    }
  }, [initialQuery, user]);

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
    <div className="max-w-7xl mx-auto space-y-8 pb-24 px-6">
      {/* Header */}
      <div className="bg-parchment border border-divider p-10 md:p-16 rounded-library space-y-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Book size={180} className="text-ink" />
        </div>
        
        <div className="relative z-10 space-y-6 max-w-4xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-library bg-ink text-parchment flex items-center justify-center shadow-sm">
              <Library size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-serif text-ink tracking-tight">Legal Glossary</h1>
              <p className="text-[10px] text-ink/40 uppercase tracking-[0.2em] font-bold">Phase 2: Terminological Analysis</p>
            </div>
          </div>
          <p className="text-ink/60 max-w-2xl text-base leading-relaxed border-l-2 border-gold/30 pl-6 font-sans">
            Consult the institutional database for complex legal terminology, Latin maxims, 
            and judicial concepts used across Indian courts. Powered by AI for scholarly context.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative group max-w-3xl z-10 pt-4">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/30 group-focus-within:text-gold transition-colors duration-300 z-10" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Consult a term (e.g. Res Judicata, Habeas Corpus...)"
            className="w-full bg-parchment-dim border border-divider rounded-library py-5 pl-16 pr-40 text-ink focus:outline-none focus:border-ink/20 focus:bg-parchment transition-all font-medium placeholder:text-ink/30 text-lg shadow-inner"
          />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-ink text-parchment px-8 py-3 rounded-library font-bold text-[11px] uppercase tracking-widest hover:bg-ink/90 transition-all shadow-sm"
          >
            Inquire
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Main Content */}
        <div className="lg:col-span-8">
          {!activeTerm ? (
            <div className="h-[450px] flex flex-col items-center justify-center border border-divider rounded-library bg-parchment-dim space-y-6 border-dashed">
               <div className="w-16 h-16 bg-ink/5 rounded-library flex items-center justify-center">
                 <Sparkles size={32} className="text-ink/10" />
               </div>
               <div className="text-center space-y-2">
                <p className="text-ink/20 uppercase tracking-[0.3em] text-[10px] font-bold">Ready for Definition</p>
                <p className="text-ink/30 font-serif text-xl italic max-w-xs mx-auto">"Enter a legal maxim or term to unlock scholarly analysis."</p>
               </div>
            </div>
          ) : isLoading ? (
            <div className="h-[450px] flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-ink/5 rounded-library" />
                <div className="w-12 h-12 border-2 border-ink border-t-transparent rounded-library animate-spin absolute top-0" />
              </div>
              <p className="text-ink/40 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Consulting AI Scholar...</p>
            </div>
          ) : error ? (
            <div className="bg-status-red/5 border border-divider rounded-library p-16 text-center space-y-6 animate-fade-up">
              <div className="w-16 h-16 bg-status-red/10 rounded-library flex items-center justify-center mx-auto text-status-red">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif text-ink">Inquiry Failed</h3>
                <p className="text-ink/40 text-sm max-w-xs mx-auto">{error instanceof Error ? error.message : 'Failed to retrieve terminological data.'}</p>
              </div>
              <button onClick={() => window.location.reload()} className="text-gold font-bold uppercase tracking-widest text-[10px] underline underline-offset-4">Retry Inquiry</button>
            </div>
          ) : data ? (
            <div className="space-y-8 animate-fade-up">
              <div className="bg-parchment border border-divider rounded-library p-10 md:p-16 space-y-12 shadow-sm">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-gold">
                    <Info size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Institutional Definition</span>
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-serif text-ink tracking-tight">
                      {typeof data.explanation.term === 'string' ? data.explanation.term : (data.explanation.term as any)?.text || 'Legal Term'}
                    </h2>
                    <div className="p-8 bg-parchment-dim border border-divider rounded-library shadow-inner">
                      <p className="text-xl text-ink font-serif leading-relaxed italic">
                        "{typeof data.explanation.definition === 'string' ? data.explanation.definition : (data.explanation.definition as any)?.text || 'Definition unavailable.'}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-divider border-dashed border-t" />

                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-gold">
                    <Scale size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Judicial Context in India</span>
                  </div>
                  <p className="text-ink/60 leading-relaxed font-medium text-lg border-l-2 border-divider pl-6">
                    {typeof data.explanation.context_india === 'string' ? data.explanation.context_india : (data.explanation.context_india as any)?.text || 'Context unavailable.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-gold">
                      <Gavel size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Relevant Precedents</span>
                    </div>
                    <ul className="space-y-4">
                      {data.explanation.landmark_cases.map((c: any, i: number) => (
                        <li key={i} className="flex items-start gap-4 text-sm text-ink/60 leading-relaxed group">
                          <span className="text-divider font-bold">0{i+1}</span>
                          <span className="font-serif italic font-bold group-hover:text-gold transition-colors">{typeof c === 'string' ? c : (c as any)?.title || (c as any)?.name || String(c)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-gold">
                      <Library size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Related Terminology</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.explanation.related_terms.map((t: any, i: number) => (
                        <button 
                          key={i}
                          onClick={() => {
                            setSearchTerm(t);
                            setActiveTerm(t);
                          }}
                          className="px-4 py-2 bg-parchment-dim border border-divider rounded-library text-[11px] font-bold uppercase tracking-widest text-ink/40 hover:border-gold hover:text-gold transition-all shadow-sm"
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
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="bg-parchment border border-divider rounded-library p-8 space-y-8 shadow-sm">
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Frequent Inquiries</h3>
              <p className="text-[11px] text-ink/40 font-medium italic">Commonly consulted maxims and terms.</p>
            </div>
            
            <div className="space-y-1">
              {['Ratio Decidendi', 'Obiter Dicta', 'Stare Decisis', 'Ultra Vires', 'Mens Rea', 'Ad Hoc'].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setSearchTerm(t);
                    setActiveTerm(t);
                  }}
                  className="w-full text-left px-5 py-3 rounded-library text-[12px] font-bold text-ink/40 hover:bg-ink/5 hover:text-ink transition-all flex items-center justify-between group border-l-2 border-transparent hover:border-gold"
                >
                  {t}
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 text-gold" />
                </button>
              ))}
            </div>

            {data && (
              <div className="pt-8 border-t border-divider border-dashed space-y-4">
                <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.2em] font-bold">
                  <span className="text-ink/20">Archive Allocation</span>
                  <span className="text-gold">{data.usage.remaining} / {data.usage.limit}</span>
                </div>
                <div className="h-1.5 w-full bg-divider rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gold transition-all duration-1000" 
                    style={{ width: `${(data.usage.remaining / data.usage.limit) * 100}%` }}
                  />
                </div>
                <p className="text-[9px] text-ink/20 italic text-right">Daily terminological inquiry limit.</p>
              </div>
            )}
          </div>

          <div className="bg-ink p-8 rounded-library shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-parchment/60">
              <Sparkles size={16} className="text-gold" />
              <span className="text-[10px] font-bold uppercase tracking-widest">AI Librarian</span>
            </div>
            <p className="text-xs text-parchment/80 leading-relaxed font-medium italic">
              "I can explain complex Latin maxims and their specific application in modern Indian jurisprudence. Just type your inquiry above."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
